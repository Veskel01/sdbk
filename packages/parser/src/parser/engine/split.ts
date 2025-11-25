import type { Dec, Inc, RemoveCommentsSafe, Trim } from '../../utils';

/**
 * Extract content inside balanced braces { ... }.
 * Returns [body, rest] where body is the content and rest is everything after }.
 */
type ExtractBalancedBraces<
  S extends string,
  Body extends string = '',
  Depth extends number = 1
> = Depth extends 0
  ? [Body, S]
  : S extends `{${infer Rest}`
    ? ExtractBalancedBraces<Rest, `${Body}{`, Inc<Depth>>
    : S extends `}${infer Rest}`
      ? Depth extends 1
        ? [Body, Rest]
        : ExtractBalancedBraces<Rest, `${Body}}`, Dec<Depth>>
      : S extends `${infer C}${infer Rest}`
        ? ExtractBalancedBraces<Rest, `${Body}${C}`, Depth>
        : [Body, ''];

/**
 * Extract a statement with brace body.
 * Pattern: PREFIX { BODY }; REST or PREFIX { BODY } SUFFIX; REST
 */
type ExtractBraceStatement<S extends string> = S extends `${infer Before}{${infer AfterOpen}`
  ? ExtractBalancedBraces<AfterOpen> extends [
      infer Body extends string,
      infer AfterClose extends string
    ]
    ? AfterClose extends `;${infer Rest}`
      ? { stmt: `${Trim<Before>}{${Body}}`; rest: Rest }
      : AfterClose extends `${infer Suffix};${infer Rest}`
        ? { stmt: `${Trim<Before>}{${Body}}${Suffix}`; rest: Rest }
        : { stmt: `${Trim<Before>}{${Body}}${AfterClose}`; rest: '' }
    : null
  : null;

/**
 * Extract a simple statement (no braces).
 */
type ExtractSimpleStatement<S extends string> = S extends `${infer Stmt};${infer Rest}`
  ? Trim<Stmt> extends ''
    ? null
    : { stmt: Trim<Stmt>; rest: Rest }
  : Trim<S> extends ''
    ? null
    : { stmt: Trim<S>; rest: '' };

/**
 * Check if the next statement has braces (function body etc).
 */
type NextHasBraces<S extends string> = S extends `${infer Before};${string}`
  ? Before extends `${string}{${string}`
    ? true
    : false
  : S extends `${string}{${string}`
    ? true
    : false;

/**
 * Split statements handling brace depth.
 */
type SplitWithDepth<S extends string, Acc extends string[] = []> = Trim<S> extends ''
  ? Acc
  : NextHasBraces<Trim<S>> extends true
    ? ExtractBraceStatement<Trim<S>> extends {
        stmt: infer Stmt extends string;
        rest: infer Rest extends string;
      }
      ? SplitWithDepth<Rest, [...Acc, Stmt]>
      : Acc
    : ExtractSimpleStatement<Trim<S>> extends {
          stmt: infer Stmt extends string;
          rest: infer Rest extends string;
        }
      ? SplitWithDepth<Rest, [...Acc, Stmt]>
      : Acc;

/**
 * Split SurrealQL input into individual statements.
 */
export type SplitStatements<S extends string> = RemoveCommentsSafe<S> extends infer Clean extends
  string
  ? SplitWithDepth<Clean>
  : never;

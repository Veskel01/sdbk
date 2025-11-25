import type { RemoveCommentsSafe, Trim } from '../../utils';

/**
 * Remove line comments (-- comment).
 */
export type RemoveLineComments<S extends string> =
  S extends `${infer Before}--${infer _}\n${infer After}`
    ? RemoveLineComments<`${Before}\n${After}`>
    : S extends `${infer Before}--${infer _}`
      ? Before
      : S;

/**
 * Remove block comments.
 */
export type RemoveBlockComments<S extends string> =
  S extends `${infer Before}/*${infer _}*/${infer After}`
    ? RemoveBlockComments<`${Before}${After}`>
    : S;

/**
 * Remove all comments from input.
 */
export type RemoveComments<S extends string> = RemoveBlockComments<RemoveLineComments<S>>;

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
    ? ExtractBalancedBraces<Rest, `${Body}{`, _Inc<Depth>>
    : S extends `}${infer Rest}`
      ? Depth extends 1
        ? [Body, Rest]
        : ExtractBalancedBraces<Rest, `${Body}}`, _Dec<Depth>>
      : S extends `${infer C}${infer Rest}`
        ? ExtractBalancedBraces<Rest, `${Body}${C}`, Depth>
        : [Body, ''];

type _Inc<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10][N];
type _Dec<N extends number> = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10][N];

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
export type SplitStatements<S extends string> = RemoveComments<S> extends infer Clean extends string
  ? SplitWithDepth<Clean>
  : RemoveCommentsSafe<S> extends infer SafeClean extends string
    ? SplitWithDepth<SafeClean>
    : never;

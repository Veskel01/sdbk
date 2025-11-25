import type { Trim } from '../../utils';
import type { ParseStatements } from './loop';

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
 * Check if schema contains complex nested blocks (function bodies, events, etc).
 * If it only has simple statements, we can use a much faster splitting approach.
 */
type HasComplexBlocks<S extends string> = S extends `${string}{${string}` ? true : false;

/**
 * Fast split for simple schemas (no nested blocks).
 * This path is significantly faster as it doesn't need depth tracking.
 */
type FastSplit<
  S extends string,
  Acc extends string[] = []
> = S extends `${infer Stmt};${infer Rest}`
  ? Stmt extends ''
    ? FastSplit<Rest, Acc>
    : FastSplit<Rest, [...Acc, Trim<Stmt>]>
  : S extends ''
    ? Acc
    : Trim<S> extends ''
      ? Acc
      : [...Acc, Trim<S>];

/**
 * Split SurrealQL input into individual statements.
 *
 * Optimization strategy:
 * 1. Remove comments first
 * 2. Check if schema has complex blocks
 * 3. If no complex blocks, use fast path (much faster)
 * 4. Otherwise, use state machine parser with batching
 *
 * @example
 * ```typescript
 * type Statements = SplitStatements<`
 *   DEFINE TABLE user SCHEMAFULL;
 *   DEFINE FIELD name ON user TYPE string;
 * `>;
 * // => ["DEFINE TABLE user SCHEMAFULL", "DEFINE FIELD name ON user TYPE string"]
 * ```
 */
export type SplitStatements<S extends string> = RemoveComments<S> extends infer Clean extends string
  ? HasComplexBlocks<Clean> extends true
    ? ParseStatements<Clean>
    : FastSplit<Clean>
  : never;

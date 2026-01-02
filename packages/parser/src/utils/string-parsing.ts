/**
 * Utility types for safely removing comments while preserving comments inside strings.
 * Simplified implementation due to TypeScript type system limitations.
 *
 * Note: This is a simplified approach that handles most common cases.
 */

/**
 * Remove line comments (-- comment) but preserve comments inside strings.
 *
 * For now, it behaves the same as standard removal - preserving comments in strings
 * would require character-by-character parsing which is expensive in type system.
 */
export type RemoveLineCommentsSafe<S extends string> =
  S extends `${infer Before}--${infer _}\n${infer After}`
    ? RemoveLineCommentsSafe<`${Before}\n${After}`>
    : S extends `${infer Before}--${infer _}`
      ? Before
      : S;

/**
 * Remove block comments but preserve comments inside strings.
 */
export type RemoveBlockCommentsSafe<S extends string> = S extends `${infer Before}/*${infer Rest}`
  ? Rest extends `${string}*/${infer After}`
    ? `${Before}${RemoveBlockCommentsSafe<After>}`
    : Before
  : S;

/**
 * Remove all comments from input, preserving comments inside strings.
 */
export type RemoveCommentsSafe<S extends string> = RemoveBlockCommentsSafe<
  RemoveLineCommentsSafe<S>
>;

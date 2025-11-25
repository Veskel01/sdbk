/* biome-ignore-all lint/suspicious/noEmptyInterface: Required for augmentation */
/* biome-ignore-all lint/correctness/noUnusedVariables: Required for augmentation */

/**
 * Registry of statement parsers.
 * Modules can augment this interface to add their own parsers.
 *
 * @example
 * ```typescript
 * declare module '@sdbk/core/parser/engine/registry' {
 *   interface StatementParsers<S extends string> {
 *     TABLE: ParseDefineTable<S>;
 *   }
 * }
 * ```
 */
export interface StatementParsers<S extends string> {}

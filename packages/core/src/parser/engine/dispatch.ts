import type { StatementParsers } from '../../statements';
import type { NormalizeWhitespace, Trim, Upper } from '../../utils';

/**
 * Fast keyword extraction for dispatcher.
 * Extracts "DEFINE <TYPE>" pattern in one step.
 * Normalizes whitespace to handle multiple spaces, tabs, and newlines.
 */
type ExtractDefineKeyword<S extends string> = Upper<
  NormalizeWhitespace<Trim<S>>
> extends `DEFINE ${infer Type} ${string}`
  ? Upper<Type>
  : never;

/**
 * Parse statement by dispatching based on keyword lookup.
 * This is significantly faster than nested ternary conditionals
 * and allows for modular extension via interface merging.
 *
 * @example
 * ```typescript
 * type Result = ParseStatement<'DEFINE TABLE user SCHEMAFULL'>;
 * // Result is TableResult<'user', 'schemafull', ...>
 * ```
 */
export type ParseStatement<S extends string> = ExtractDefineKeyword<S> extends infer Keyword
  ? Keyword extends keyof StatementParsers<NormalizeWhitespace<Trim<S>>>
    ? StatementParsers<NormalizeWhitespace<Trim<S>>>[Keyword]
    : never
  : never;

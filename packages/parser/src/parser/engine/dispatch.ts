import type { StatementParsers } from '../../statements';
import type { NormalizeWhitespace, Trim, Upper } from '../../utils';
import type { ParseErrors } from '../errors';

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
 * Returns a parse error if the statement type is unknown or invalid.
 *
 * @example
 * ```typescript
 * type Result = ParseStatement<'DEFINE TABLE user SCHEMAFULL'>;
 * // Result is TableResult<'user', 'schemafull', ...>
 *
 * type Error = ParseStatement<'DEFINE INVALID user'>;
 * // Error is ParseError<'Unknown DEFINE statement type'>
 * ```
 */
export type ParseStatement<S extends string> = NormalizeWhitespace<Trim<S>> extends ''
  ? ParseErrors.InvalidSyntax
  : ExtractDefineKeyword<S> extends infer Keyword
    ? [Keyword] extends [never]
      ? ParseErrors.InvalidSyntax
      : Keyword extends keyof StatementParsers<NormalizeWhitespace<Trim<S>>>
        ? StatementParsers<NormalizeWhitespace<Trim<S>>>[Keyword]
        : ParseErrors.UnknownStatement
    : ParseErrors.InvalidSyntax;

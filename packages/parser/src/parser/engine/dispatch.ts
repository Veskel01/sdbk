import type { StatementParsers } from '../../statements';
import type { NormalizeWhitespace, Trim, Upper } from '../../utils';
import type { ParseErrors } from '../errors';

/**
 * Fast keyword extraction for dispatcher.
 * Extracts "DEFINE <TYPE>" pattern in one step.
 * Normalizes whitespace to handle multiple spaces, tabs, and newlines.
 */
type ExtractDefineKeyword<S extends string> =
  Upper<NormalizeWhitespace<Trim<S>>> extends `DEFINE ${infer Type} ${string}`
    ? Upper<Type>
    : never;

/**
 * Parses a single `DEFINE ...` statement into its strongly typed representation.
 *
 * @remarks
 * - Dispatches to the appropriate entry in {@link StatementParsers} based on the `DEFINE <KIND>` keyword.
 * - Returns a {@link ParseErrors.ParseError} subtype when the input is empty, syntactically invalid, or uses an unknown `DEFINE` kind.
 *
 * @example
 * ```ts
 * type T1 = ParseStatement<'DEFINE TABLE user SCHEMAFULL'>; // TableResult<'user', ...>
 * type T2 = ParseStatement<'DEFINE FIELD email ON TABLE user TYPE string'>; // FieldResult<...>
 * type E  = ParseStatement<'DEFINE INVALID user'>;           // ParseErrors.UnknownStatement
 * ```
 */
export type ParseStatement<S extends string> =
  NormalizeWhitespace<Trim<S>> extends ''
    ? ParseErrors.InvalidSyntax
    : ExtractDefineKeyword<S> extends infer Keyword
      ? [Keyword] extends [never]
        ? ParseErrors.InvalidSyntax
        : Keyword extends keyof StatementParsers<NormalizeWhitespace<Trim<S>>>
          ? StatementParsers<NormalizeWhitespace<Trim<S>>>[Keyword]
          : ParseErrors.UnknownStatement
      : ParseErrors.InvalidSyntax;

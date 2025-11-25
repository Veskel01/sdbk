/**
 * Branded error type produced by the type‑level parser.
 *
 * @remarks
 * A `ParseError` value indicates that parsing failed instead of yielding a concrete `*Result` type.
 * The `__error` brand lets you distinguish error results from valid parse outputs in conditional types.
 *
 * @typeParam Message - Human‑readable description of the failure.
 */
export interface ParseError<Message extends string = string> {
  /** Brand property to identify parse errors */
  readonly __error: true;
  /** Human-readable error message */
  readonly message: Message;
  /** Error kind discriminator */
  readonly kind: 'parse_error';
}

/**
 * Factory type for creating parse errors with specific messages.
 *
 * @typeParam Message - The error message
 */
export type CreateParseError<Message extends string> = ParseError<Message>;

/**
 * Utility type that checks whether a type is a {@link ParseError}.
 *
 * @typeParam T - Candidate type returned from a parser.
 */
export type IsParseError<T> = T extends ParseError<string> ? true : false;

/**
 * Extracts the `message` from a {@link ParseError}.
 *
 * @typeParam T - A concrete `ParseError` subtype.
 */
export type ExtractErrorMessage<T extends ParseError<string>> = T['message'];

/**
 * Predefined parse error kinds used by the SurrealQL type‑level parser.
 *
 * @remarks
 * These aliases make it easy to pattern‑match on specific failure modes
 * (unknown statement kind, invalid syntax, invalid identifiers, excessive nesting, and so on).
 */
export namespace ParseErrors {
  /** Returned when a DEFINE statement type is not recognized */
  export type UnknownStatement = CreateParseError<'Unknown DEFINE statement type'>;

  /** Returned when the SurrealQL syntax is invalid */
  export type InvalidSyntax = CreateParseError<'Invalid SurrealQL syntax'>;

  /** Returned when a block comment is not properly closed */
  export type UnclosedComment = CreateParseError<'Unclosed comment block'>;

  /** Returned when a string literal is not properly closed */
  export type UnclosedString = CreateParseError<'Unclosed string literal'>;

  /** Returned when a type specification is invalid */
  export type InvalidType = CreateParseError<'Invalid type specification'>;

  /** Returned when a table name violates naming rules */
  export type InvalidTableName =
    CreateParseError<'Invalid table name: must not be empty, start with digit, or contain special characters'>;

  /** Returned when a field name violates naming rules */
  export type InvalidFieldName =
    CreateParseError<'Invalid field name: must not be empty, start with digit, or contain special characters'>;

  /** Returned when type nesting exceeds the maximum depth of 10 levels */
  export type TypeDepthExceeded =
    CreateParseError<'Type nesting depth exceeded maximum of 10 levels'>;
}

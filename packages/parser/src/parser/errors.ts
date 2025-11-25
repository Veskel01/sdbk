/**
 * Branded error type for parse errors.
 *
 * @remarks
 * When parsing fails, this type is returned instead of the expected result.
 * The `__error` brand allows TypeScript to distinguish errors from valid results.
 *
 * @typeParam Message - The error message describing what went wrong
 *
 * @example
 * ```typescript
 * // Check if a result is an error
 * type Result = ParseStatement<'INVALID'>;
 * type IsError = Result extends ParseError ? true : false; // true
 * ```
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
 * Type guard to check if a type is a parse error.
 *
 * @typeParam T - The type to check
 *
 * @example
 * ```typescript
 * type Result = ParseStatement<'DEFINE TABLE user'>;
 * type Check = IsParseError<Result>; // false
 *
 * type BadResult = ParseStatement<'INVALID'>;
 * type BadCheck = IsParseError<BadResult>; // true
 * ```
 */
export type IsParseError<T> = T extends ParseError<string> ? true : false;

/**
 * Extracts the error message from a parse error type.
 *
 * @typeParam T - A ParseError type
 */
export type ExtractErrorMessage<T extends ParseError<string>> = T['message'];

/**
 * Namespace containing common parse error types.
 *
 * @remarks
 * These errors cover the most common failure cases when parsing SurrealQL.
 * Each error type has a descriptive message to help diagnose issues.
 *
 * @example
 * ```typescript
 * // Unknown statement type
 * type Err1 = ParseErrors.UnknownStatement;
 *
 * // Invalid syntax
 * type Err2 = ParseErrors.InvalidSyntax;
 *
 * // Type nesting too deep
 * type Err3 = ParseErrors.TypeDepthExceeded;
 * ```
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

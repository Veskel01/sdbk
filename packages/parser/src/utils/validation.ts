import type { Trim } from './string';

/**
 * Checks if a string starts with a digit.
 */
type _StartsWithDigit<S extends string> = S extends `${infer First}${string}`
  ? First extends '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    ? true
    : false
  : false;

/**
 * Checks if a string contains invalid characters for table names.
 * Invalid characters: spaces, dots, commas, semicolons, parentheses, brackets.
 */
type _ContainsInvalidTableChars<S extends string> = S extends `${string} ${string}`
  ? true
  : S extends `${string}.${string}`
    ? true
    : S extends `${string},${string}`
      ? true
      : S extends `${string};${string}`
        ? true
        : S extends `${string}(${string}`
          ? true
          : S extends `${string})${string}`
            ? true
            : S extends `${string}[${string}`
              ? true
              : S extends `${string}]${string}`
                ? true
                : false;

/**
 * Checks if a string contains invalid characters for field names.
 * Note: Dots (.) are ALLOWED for nested fields like `emails.address`.
 */
type _ContainsInvalidFieldChars<S extends string> = S extends `${string} ${string}`
  ? true
  : S extends `${string},${string}`
    ? true
    : S extends `${string};${string}`
      ? true
      : S extends `${string}(${string}`
        ? true
        : S extends `${string})${string}`
          ? true
          : S extends `${string}[${string}`
            ? true
            : S extends `${string}]${string}`
              ? true
              : false;

/**
 * Checks if a table name is valid according to SurrealDB rules.
 *
 * @remarks
 * Rules:
 * - Must not be empty
 * - Must not start with a digit
 * - Must not contain spaces, dots, or special SQL characters
 *
 * @typeParam S - The table name to validate
 */
export type IsValidTableName<S extends string> = Trim<S> extends ''
  ? false
  : _StartsWithDigit<Trim<S>> extends true
    ? false
    : _ContainsInvalidTableChars<Trim<S>> extends true
      ? false
      : true;

/**
 * Checks if a field name is valid according to SurrealDB rules.
 *
 * @remarks
 * Rules:
 * - Must not be empty
 * - Must not start with a digit
 * - Must not contain spaces or special SQL characters
 * - Dots (.) ARE allowed for nested fields (e.g., `emails.address`)
 *
 * @typeParam S - The field name to validate
 */
export type IsValidFieldName<S extends string> = Trim<S> extends ''
  ? false
  : _StartsWithDigit<Trim<S>> extends true
    ? false
    : _ContainsInvalidFieldChars<Trim<S>> extends true
      ? false
      : true;

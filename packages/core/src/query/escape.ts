/**
 * Unicode brackets used for SurrealDB identifier escaping.
 */
const L_BRACKET = '⟨';
const R_BRACKET = '⟩';

/**
 * Maximum safe integer value for BigInt escaping.
 */
const MAX_I64 = 9223372036854775807n;

/**
 * Regex pattern for valid bare identifiers (no escaping needed).
 * Must start with letter or underscore, followed by alphanumeric or underscore.
 */
const BARE_IDENT_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Regex pattern for strings that are only numbers (needs escaping).
 */
const ONLY_NUMBERS_REGEX = /^[\d_]+$/;

/**
 * Checks if a string contains only numeric characters and underscores.
 * @param str - The string to check
 * @returns `true` if the string is numeric-only
 */
function isOnlyNumbers(str: string): boolean {
  return ONLY_NUMBERS_REGEX.test(str);
}

/**
 * Escapes a string to be used as a valid SurrealQL identifier.
 * Uses Unicode brackets `⟨⟩` for escaping (SurrealDB standard).
 *
 * @param str - The string to escape
 * @returns The escaped identifier string
 *
 * @example
 * ```ts
 * escapeIdent('users')        // 'users' (no escaping needed)
 * escapeIdent('user-data')    // '⟨user-data⟩'
 * escapeIdent('123')          // '⟨123⟩' (numeric strings)
 * escapeIdent('')             // '⟨⟩' (empty string)
 * escapeIdent('hello⟩world')  // '⟨hello\⟩world⟩' (escaped bracket)
 * ```
 */
export function escapeIdent(str: string): string {
  // Numeric-looking strings should always be escaped to prevent
  // them from being parsed as numbers
  if (isOnlyNumbers(str)) {
    return `${L_BRACKET}${str}${R_BRACKET}`;
  }

  // Empty strings should always be escaped
  if (str === '') {
    return `${L_BRACKET}${R_BRACKET}`;
  }

  // Check if the string is a valid bare identifier
  if (BARE_IDENT_REGEX.test(str)) {
    return str;
  }

  // Escape the closing bracket within the identifier
  const escaped = str.replaceAll(R_BRACKET, `\\${R_BRACKET}`);
  return `${L_BRACKET}${escaped}${R_BRACKET}`;
}

/**
 * Escapes a string to be used as a valid SurrealQL name using backticks.
 * This is an alternative escaping method for compatibility.
 *
 * @param str - The string to escape
 * @returns The escaped name string
 *
 * @example
 * ```ts
 * escapeName('users')       // 'users' (no escaping needed)
 * escapeName('user-data')   // '`user-data`'
 * escapeName('hello`world') // '`hello``world`' (escaped backtick)
 * ```
 */
export function escapeName(str: string): string {
  // Check if the string is a valid bare identifier
  if (BARE_IDENT_REGEX.test(str)) {
    return str;
  }

  // Escape backticks by doubling them
  const escaped = str.replaceAll('`', '``');
  return `\`${escaped}\``;
}

/**
 * Escapes a number to be used as a valid SurrealQL identifier.
 * Numbers larger than MAX_I64 are wrapped in Unicode brackets.
 *
 * @param num - The number to escape
 * @returns The escaped number string
 *
 * @example
 * ```ts
 * escapeNumber(42)                           // '42'
 * escapeNumber(9223372036854775808n)         // '⟨9223372036854775808⟩'
 * ```
 */
export function escapeNumber(num: number | bigint): string {
  const n = typeof num === 'bigint' ? num : BigInt(Math.floor(num));
  return n <= MAX_I64 ? num.toString() : `${L_BRACKET}${num}${R_BRACKET}`;
}

/**
 * Escapes a string for use in a SurrealQL string literal.
 * Handles special characters and quotes.
 *
 * @param str - The string to escape
 * @returns The escaped string with surrounding quotes
 *
 * @example
 * ```ts
 * escapeString('hello')        // '"hello"'
 * escapeString('hello"world')  // '"hello\"world"'
 * escapeString('line\nbreak')  // '"line\\nbreak"'
 * ```
 */
export function escapeString(str: string): string {
  return JSON.stringify(str);
}

/**
 * Removes surrounding backticks from a string if present.
 *
 * @param str - The string to process.
 * @returns The string without surrounding backticks.
 *
 * @example
 * ```ts
 * stripBackticks('`hello`');  // "hello"
 * stripBackticks('hello');    // "hello"
 * stripBackticks('`test');    // "`test" (incomplete backticks)
 * ```
 */
export function stripBackticks(str: string): string {
  return str.startsWith('`') && str.endsWith('`') ? str.slice(1, -1) : str;
}

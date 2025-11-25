/**
 * Checks if a value is null or undefined.
 * @param value - The value to check.
 * @returns `true` if the value is `null` or `undefined`, `false` otherwise.
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined || typeof value === 'undefined';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

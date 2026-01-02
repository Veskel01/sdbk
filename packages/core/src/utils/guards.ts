/**
 * Checks if a value is null or undefined.
 * @param value - The value to check.
 * @returns `true` if the value is `null` or `undefined`, `false` otherwise.
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined || typeof value === 'undefined';
}

/**
 * Checks if a value is an object.
 * @param value - The value to check.
 * @returns `true` if the value is an object, `false` otherwise.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Checks if a value is a string.
 * @param value - The value to check.
 * @returns `true` if the value is a string, `false` otherwise.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a plain object.
 *
 * @param value - The value to check
 * @returns `true` if the value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

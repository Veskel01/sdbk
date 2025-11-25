/**
 * Adds 1 to a number using tuple length.
 *
 * @example
 * ```typescript
 * type Result = Add1<5>; // 6
 * ```
 */
export type Add1<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N
  ? [...Acc, unknown]['length']
  : Add1<N, [...Acc, unknown]>;

/**
 * Subtracts 1 from a number using tuple length.
 *
 * @example
 * ```typescript
 * type Result = Sub1<5>; // 4
 * type Result2 = Sub1<0>; // 0
 * ```
 */
export type Sub1<N extends number, Acc extends unknown[] = []> = N extends 0
  ? 0
  : Acc['length'] extends N
    ? Acc extends [unknown, ...infer Rest]
      ? Rest['length']
      : 0
    : Sub1<N, [...Acc, unknown]>;

/**
 * Checks if a number is zero.
 *
 * @example
 * ```typescript
 * type Result = IsZero<0>; // true
 * type Result2 = IsZero<5>; // false
 * ```
 */
export type IsZero<N extends number> = N extends 0 ? true : false;

/**
 * Parses a string as a number literal type.
 *
 * @example
 * ```typescript
 * type Result = ParseNumber<'42'>; // 42
 * type Result2 = ParseNumber<'abc'>; // undefined
 * ```
 */
export type ParseNumber<S extends string> = S extends `${infer N extends number}` ? N : undefined;

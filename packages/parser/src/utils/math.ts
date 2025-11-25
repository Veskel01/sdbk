/**
 * Lookup table for incrementing numbers 0-50.
 * Much faster than recursive tuple approach.
 *
 * @example
 * ```typescript
 * type Result = Inc<5>; // 6
 * type Result2 = Inc<0>; // 1
 * ```
 */
export type Inc<N extends number> = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51
][N];

/**
 * Lookup table for decrementing numbers 0-51.
 * Returns 0 for input 0, otherwise N-1.
 *
 * @example
 * ```typescript
 * type Result = Dec<5>; // 4
 * type Result2 = Dec<0>; // 0 (clamped)
 * ```
 */
export type Dec<N extends number> = [
  0,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50
][N];

/**
 * Add two numbers using lookup table (0-20 range).
 * For compile-time arithmetic in type-level parsing.
 *
 * @example
 * ```typescript
 * type Result = Add<3, 5>; // 8
 * type Result2 = Add<10, 10>; // 20
 * ```
 */
export type Add<A extends number, B extends number> = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
  [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
  [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
][A][B];

/**
 * Subtract B from A using lookup table (0-20 range, clamped to 0).
 * For compile-time arithmetic in type-level parsing.
 *
 * @example
 * ```typescript
 * type Result = Sub<8, 3>; // 5
 * type Result2 = Sub<3, 8>; // 0 (clamped)
 * ```
 */
export type Sub<A extends number, B extends number> = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  [7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  [8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3],
  [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4],
  [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5],
  [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6],
  [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7],
  [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8],
  [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10]
][A][B];

/**
 * Combined add and subtract: (D + Add) - Sub.
 * Useful for depth tracking with parentheses.
 *
 * @example
 * ```typescript
 * type Result = AddSub<5, 3, 2>; // 6 (5 + 3 - 2)
 * ```
 */
export type AddSub<D extends number, A extends number, S extends number> = Sub<Add<D, A>, S>;

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

/**
 * @deprecated Use Inc<N> instead - faster lookup table implementation.
 */
export type Add1<N extends number> = Inc<N>;

/**
 * @deprecated Use Dec<N> instead - faster lookup table implementation.
 */
export type Sub1<N extends number> = Dec<N>;

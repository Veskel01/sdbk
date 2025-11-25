/**
 * Gets the first element type of a tuple.
 *
 * @example
 * ```typescript
 * type Result = Head<[1, 2, 3]>; // 1
 * type Result2 = Head<['a', 'b']>; // 'a'
 * ```
 */
export type Head<T extends unknown[]> = T extends [infer First, ...unknown[]] ? First : never;

/**
 * Gets all but the first element of a tuple.
 *
 * @example
 * ```typescript
 * type Result = Tail<[1, 2, 3]>; // [2, 3]
 * type Result2 = Tail<['a']>; // []
 * ```
 */
export type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : [];

/**
 * Gets the last element type of a tuple.
 *
 * @example
 * ```typescript
 * type Result = Last<[1, 2, 3]>; // 3
 * type Result2 = Last<['a', 'b']>; // 'b'
 * ```
 */
export type Last<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;

/**
 * Prepends an element to a tuple.
 *
 * @example
 * ```typescript
 * type Result = Prepend<0, [1, 2, 3]>; // [0, 1, 2, 3]
 * ```
 */
export type Prepend<E, T extends unknown[]> = [E, ...T];

/**
 * Appends an element to a tuple.
 *
 * @example
 * ```typescript
 * type Result = Append<[1, 2], 3>; // [1, 2, 3]
 * ```
 */
export type Append<T extends unknown[], E> = [...T, E];

/**
 * Gets the length of a tuple as a number literal type.
 *
 * @example
 * ```typescript
 * type Result = Length<[1, 2, 3]>; // 3
 * ```
 */
export type Length<T extends unknown[]> = T['length'];

/**
 * Checks if a tuple is empty.
 *
 * @example
 * ```typescript
 * type Result = IsEmpty<[]>; // true
 * type Result2 = IsEmpty<[1]>; // false
 * ```
 */
export type IsEmpty<T extends unknown[]> = T extends [] ? true : false;

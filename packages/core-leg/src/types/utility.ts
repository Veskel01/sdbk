// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Trims whitespace from both ends of a string type.
 *
 * @example
 * Trim<'  hello  '> → 'hello'
 * Trim<' test'> → 'test'
 */
export type Trim<T extends string> = T extends ` ${infer R}`
  ? Trim<R>
  : T extends `${infer R} `
    ? Trim<R>
    : T extends `\n${infer R}`
      ? Trim<R>
      : T extends `${infer R}\n`
        ? Trim<R>
        : T extends `\t${infer R}`
          ? Trim<R>
          : T extends `${infer R}\t`
            ? Trim<R>
            : T;

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Gets the first element type of a tuple.
 *
 * @example
 * Head<[1, 2, 3]> → 1
 * Head<['a', 'b']> → 'a'
 */
export type Head<T extends any[]> = T extends [infer First, ...any[]] ? First : never;

/**
 * Gets all but the first element of a tuple.
 *
 * @example
 * Tail<[1, 2, 3]> → [2, 3]
 * Tail<['a']> → []
 */
export type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : [];

/**
 * Gets the last element type of a tuple.
 *
 * @example
 * Last<[1, 2, 3]> → 3
 * Last<['a', 'b']> → 'b'
 */
export type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

/**
 * Prepends an element to a tuple.
 *
 * @example
 * Prepend<0, [1, 2, 3]> → [0, 1, 2, 3]
 */
export type Prepend<E, T extends any[]> = [E, ...T];

/**
 * Appends an element to a tuple.
 *
 * @example
 * Append<[1, 2], 3> → [1, 2, 3]
 */
export type Append<T extends any[], E> = [...T, E];

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Forces TypeScript to expand/simplify a type for better readability.
 *
 * @example
 * type Complex = { a: string } & { b: number };
 * type Simple = Simplify<Complex>; // { a: string; b: number }
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Makes all properties of an object required.
 *
 * @example
 * RequiredKeys<{ a?: string; b?: number }> → { a: string; b: number }
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: T[K];
};

/**
 * Makes all properties of an object optional.
 *
 * @example
 * OptionalKeys<{ a: string; b: number }> → { a?: string; b?: number }
 */
export type OptionalKeys<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Extracts keys of an object that have a specific value type.
 *
 * @example
 * KeysOfType<{ a: string; b: number; c: string }, string> → 'a' | 'c'
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Picks properties from an object that have a specific value type.
 *
 * @example
 * PickByType<{ a: string; b: number; c: string }, string> → { a: string; c: string }
 */
export type PickByType<T, V> = Pick<T, KeysOfType<T, V>>;

/**
 * Omits properties from an object that have a specific value type.
 *
 * @example
 * OmitByType<{ a: string; b: number; c: string }, string> → { b: number }
 */
export type OmitByType<T, V> = Omit<T, KeysOfType<T, V>>;

// ============================================================================
// UNION UTILITIES
// ============================================================================

/**
 * Converts a union to an intersection.
 *
 * @example
 * UnionToIntersection<{ a: 1 } | { b: 2 }> → { a: 1 } & { b: 2 }
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// ============================================================================
// CONDITIONAL UTILITIES
// ============================================================================

/**
 * Returns A if condition is true, B otherwise.
 *
 * @example
 * If<true, 'yes', 'no'> → 'yes'
 * If<false, 'yes', 'no'> → 'no'
 */
export type If<Cond extends boolean, A, B> = Cond extends true ? A : B;

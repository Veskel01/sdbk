/**
 * Forces TypeScript to expand/simplify a type for better readability.
 *
 * @example
 * ```typescript
 * type Complex = { a: string } & { b: number };
 * type Simple = Simplify<Complex>; // { a: string; b: number }
 * ```
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Deep simplify - recursively expands nested types.
 *
 * @example
 * ```typescript
 * type Nested = { a: { b: string } & { c: number } };
 * type Simple = DeepSimplify<Nested>; // { a: { b: string; c: number } }
 * ```
 */
export type DeepSimplify<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: DeepSimplify<O[K]> }
    : never
  : T;

/**
 * Makes all properties of an object required.
 *
 * @example
 * ```typescript
 * type Result = RequiredKeys<{ a?: string; b?: number }>; // { a: string; b: number }
 * ```
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: T[K];
};

/**
 * Makes all properties of an object optional.
 *
 * @example
 * ```typescript
 * type Result = OptionalKeys<{ a: string; b: number }>; // { a?: string; b?: number }
 * ```
 */
export type OptionalKeys<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Extracts keys of an object that have a specific value type.
 *
 * @example
 * ```typescript
 * type Result = KeysOfType<{ a: string; b: number; c: string }, string>; // 'a' | 'c'
 * ```
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Picks properties from an object that have a specific value type.
 *
 * @example
 * ```typescript
 * type Result = PickByType<{ a: string; b: number; c: string }, string>; // { a: string; c: string }
 * ```
 */
export type PickByType<T, V> = Pick<T, KeysOfType<T, V>>;

/**
 * Omits properties from an object that have a specific value type.
 *
 * @example
 * ```typescript
 * type Result = OmitByType<{ a: string; b: number; c: string }, string>; // { b: number }
 * ```
 */
export type OmitByType<T, V> = Omit<T, KeysOfType<T, V>>;

/**
 * Converts a union to an intersection.
 *
 * @example
 * ```typescript
 * type Result = UnionToIntersection<{ a: 1 } | { b: 2 }>; // { a: 1 } & { b: 2 }
 * ```
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Empty object type.
 */
export type EmptyObject = Record<string, never>;

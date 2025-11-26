import type { AnyTypeKind, DataType } from './type-map';

/**
 * Deeply unwrap all DataType wrappers from a type.
 * Recursively removes phantom type wrappers while preserving the underlying structure.
 *
 * @typeParam T - The type to unwrap
 *
 * @example
 * ```ts
 * // Simple types
 * type A = UnwrapDataType<StringType>;  // string
 * type B = UnwrapDataType<IntType>;     // number
 *
 * // Nested types
 * type C = UnwrapDataType<ArrayType<StringType>>;  // string[]
 *
 * // Complex objects
 * type D = UnwrapDataType<{ name: StringType; age: IntType }>;  // { name: string; age: number }
 * ```
 */
export type UnwrapDataType<T> = T extends DataType<infer V, AnyTypeKind>
  ? UnwrapDataType<V>
  : T extends readonly [infer H, ...infer R]
    ? [UnwrapDataType<H>, ...UnwrapTupleRest<R>]
    : T extends readonly (infer E)[]
      ? UnwrapDataType<E>[]
      : T extends object
        ? { [K in keyof T]: UnwrapDataType<T[K]> }
        : T;

/** Helper for unwrapping tuple rest elements */
type UnwrapTupleRest<T> = T extends readonly [infer H, ...infer R]
  ? [UnwrapDataType<H>, ...UnwrapTupleRest<R>]
  : [];

/**
 * Builds an array of length N filled with type T using exponential doubling.
 * Much more efficient than linear recursion for large arrays.
 *
 * @example
 * ```typescript
 * type Arr = BuildArray<5, 'x'>; // ['x', 'x', 'x', 'x', 'x']
 * ```
 */
export type BuildArray<N extends number, T, Acc extends T[] = []> = Acc['length'] extends N
  ? Acc
  : BuildArray<N, T, [...Acc, T]>;

/**
 * Doubles an array's length by concatenating it with itself.
 */
export type DoubleArray<T extends unknown[]> = [...T, ...T];

/**
 * Builds a large array using exponential growth.
 * More efficient for arrays > 10 elements.
 */
export type BuildLargeArray<N extends number, T, Acc extends T[] = [T]> = Acc['length'] extends N
  ? Acc
  : Acc['length'] extends 0
    ? BuildLargeArray<N, T, [T]>
    : DoubleArray<Acc>['length'] extends infer Doubled extends number
      ? Doubled extends N
        ? DoubleArray<Acc>
        : Doubled extends number
          ? N extends number
            ? Doubled extends N
              ? DoubleArray<Acc>
              : BuildLargeArray<N, T, [...Acc, T]>
            : never
          : never
      : never;

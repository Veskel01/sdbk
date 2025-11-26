/**
 * Represents an abstract class.
 * @param T - The type of the class
 * @returns The abstract class
 */
export type AbstractClass<T> = abstract new (...args: any[]) => T;

/**
 * Represents a class.
 * @param T - The type of the class
 * @returns The class
 */
export type Class<T> = (abstract new (...args: any[]) => T) | (new (...args: any[]) => T);

/**
 * Represents any class.
 * @param T - The type of the class
 * @returns The class
 */
export type AnyClass<T = unknown> = Class<T> | AbstractClass<T>;

/**
 * Helper type to represent any string. Works well with autocompletion for string literals.
 * @example
 * ```ts
 * type Test = 'test' | AnyString; // 'hello' | string
 * ```
 */
export type AnyString = string & {};

/**
 * Trims leading whitespace from a string type.
 *
 * @typeParam T - The string to trim
 *
 * @example
 * ```ts
 * type Result = TrimStart<'  hello'>; // 'hello'
 * ```
 */
export type TrimStart<T extends string> = T extends ` ${infer R}`
  ? TrimStart<R>
  : T extends `\n${infer R}`
    ? TrimStart<R>
    : T extends `\t${infer R}`
      ? TrimStart<R>
      : T extends `\r${infer R}`
        ? TrimStart<R>
        : T;

/**
 * Trims trailing whitespace from a string type.
 *
 * @typeParam T - The string to trim
 *
 * @example
 * ```ts
 * type Result = TrimEnd<'hello  '>; // 'hello'
 * ```
 */
export type TrimEnd<T extends string> = T extends `${infer R} `
  ? TrimEnd<R>
  : T extends `${infer R}\n`
    ? TrimEnd<R>
    : T extends `${infer R}\t`
      ? TrimEnd<R>
      : T extends `${infer R}\r`
        ? TrimEnd<R>
        : T;

/**
 * Trims whitespace from both ends of a string type.
 *
 * @typeParam T - The string to trim
 *
 * @example
 * ```ts
 * type Result = Trim<'  hello  '>; // 'hello'
 * ```
 */
export type Trim<T extends string> = TrimStart<TrimEnd<T>>;

/**
 * Increments a number type by 1.
 * Supports values 0-20.
 *
 * @typeParam N - The number to increment
 *
 * @example
 * ```ts
 * type Five = Inc<4>; // 5
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
  21
][N];

/**
 * Decrements a number type by 1.
 * Supports values 0-21. Returns 0 for 0 and 1.
 *
 * @typeParam N - The number to decrement
 *
 * @example
 * ```ts
 * type Four = Dec<5>; // 4
 * type Zero = Dec<0>; // 0
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
  20
][N];

/**
 * Type that matches all function types.
 *
 * @example
 * ```ts
 * type AnyFunction = (...args: any[]) => any;
 * ```
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Flattens intersection types into a single object type.
 * Improves readability of complex intersections in IDE tooltips.
 *
 * @typeParam T - The type to prettify
 *
 * @example
 * ```ts
 * type Ugly = { a: string } & { b: number };
 * type Pretty = Prettify<Ugly>; // { a: string; b: number }
 * ```
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Converts a string literal type to lowercase.
 *
 * @typeParam S - The string to convert
 *
 * @example
 * ```ts
 * type Result = Lower<'HELLO'>; // 'hello'
 * ```
 */
export type Lower<S extends string> = Lowercase<S>;

/**
 * Converts a string literal type to uppercase.
 *
 * @typeParam S - The string to convert
 *
 * @example
 * ```ts
 * type Result = Upper<'hello'>; // 'HELLO'
 * ```
 */
export type Upper<S extends string> = Uppercase<S>;

/**
 * Omit keys from an object where the value extends the given condition.
 *
 * @typeParam T - The object type
 * @typeParam Condition - The condition to match against values
 *
 * @example
 * ```ts
 * type Obj = { name: string; age: number; greet: () => void };
 * type NoFunctions = OmitKeysWhen<Obj, Function>;
 * // { name: string; age: number }
 * ```
 */
export type OmitKeysWhen<T, Condition> = {
  [K in keyof T as T[K] extends Condition ? never : K]: T[K];
};

/**
 * Pick keys from an object where the value extends the given condition.
 *
 * @typeParam T - The object type
 * @typeParam Condition - The condition to match against values
 *
 * @example
 * ```ts
 * type Obj = { name: string; age: number; greet: () => void };
 * type OnlyFunctions = PickKeysWhen<Obj, Function>;
 * // { greet: () => void }
 * ```
 */
export type PickKeysWhen<T, Condition> = {
  [K in keyof T as T[K] extends Condition ? K : never]: T[K];
};

/**
 * Overrides multiple properties in an object with new value types.
 * Makes the overridden properties required (removes optionality).
 * @example
 * type Options = { name?: string; age?: number; active?: boolean };
 * type Updated = Override<Options, { age: 25; active: true }>; // { name?: string; age: 25; active: true }
 */
export type Override<O extends object, P extends object> = Prettify<
  Omit<O, keyof P> & { readonly [K in keyof P]: P[K] }
>;

/**
 * Represents an abstract class.
 * @param T - The type of the class
 */
export type AbstractClass<T> = abstract new (...args: any[]) => T;

/**
 * Represents a class (abstract or concrete).
 * @param T - The type of the class
 */
export type Class<T> = (abstract new (...args: any[]) => T) | (new (...args: any[]) => T);

/**
 * Represents any class (abstract or concrete).
 * @param T - The type of the class
 */
export type AnyClass<T = unknown> = Class<T> | AbstractClass<T>;

/**
 * String type that preserves autocomplete for literal unions.
 * Use with literal unions to allow any string while still showing suggestions.
 *
 * @example
 * ```ts
 * type Status = 'active' | 'inactive' | StringHint;
 * // Autocomplete shows 'active' | 'inactive' but accepts any string
 * ```
 */
export type StringHint = string & {};

/**
 * Assigns new property types to an existing object type.
 * Replaces properties from O with those from P.
 *
 * @example
 * ```ts
 * type Options = { name?: string; age?: number };
 * type Updated = Assign<Options, { age: 25 }>;
 * // { name?: string; age: 25 }
 * ```
 */
export type Assign<O extends object, P extends object> = Omit<O, keyof P> & P;

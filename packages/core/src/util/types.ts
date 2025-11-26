import type { SurrealQL } from '../query';

/**
 * Simplifies a type by removing all object properties and converting them to plain properties.
 */
export type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;

/**
 * Overrides multiple properties in an object with new value types.
 * Makes the overridden properties required (removes optionality).
 * @example
 * type Options = { name?: string; age?: number; active?: boolean };
 * type Updated = Override<Options, { age: 25; active: true }>; // { name?: string; age: 25; active: true }
 */
export type Override<O extends object, P extends object> = Simplify<
  Omit<O, keyof P> & { readonly [K in keyof P]: P[K] }
>;

/**
 * Value input type for DEFAULT and VALUE clauses.
 * Can be a literal value of type T or a SurrealQL expression.
 * @example
 * type StringExpr = ValueInput<string>; // string | SurrealQL<string>
 */
export type ValueInput<T> = T | SurrealQL;

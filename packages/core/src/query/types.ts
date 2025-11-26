import type { Identifier } from './identifier';
import type { Parameter } from './parameter';
import type { SurrealQL } from './surrealql';

/**
 * Represents a compiled SQL query with named parameter bindings.
 */
export interface Query {
  readonly query: string;
  readonly bindings: Record<string, unknown>;
}

/**
 * Represents a value that can be converted to a SurrealQL expression.
 */
export interface SQLConvertible<T = unknown> {
  toSurrealQL(): SurrealQL<T>;
}

/**
 * Phantom metadata type for compile-time type safety.
 */
export interface $SQL<T> {
  readonly type: T;
}

/**
 * A fragment that can be part of a SurrealQL query.
 * Can be a raw string, an identifier, a parameter, or any object that can be converted to SurrealQL.
 */
export type SQLFragment = string | Identifier | Parameter | SQLConvertible | SurrealQL;

import type { SurrealQL } from '../query';

export interface TableRef {
  readonly tableName: string;
}

/**
 * Phantom property type for compile-time type safety.
 * @example
 * interface WithPhantomProp<T> {
 *   readonly _: T;
 * }
 *
 * const obj: WithPhantomProp<string> = { _: 'hello' };
 * obj._.toUpperCase(); // Error: Property '_' does not exist on type 'string'.
 */
export interface WithPhantomProp<T> {
  readonly _: T & {};
}

export type AssertExpression = string | SurrealQL<boolean>;

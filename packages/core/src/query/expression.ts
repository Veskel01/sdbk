import { BINDING_TOKEN, QUERY_PARAM_TOKEN } from '../constants';
import { ENTITY_KIND, is } from '../meta';
import { getIncrementalID } from '../utils';
import { Binding } from './binding';
import { escapeIdent } from './escape';
import { Identifier } from './identifier';

/**
 * Interface for objects that can be converted to SurrealQL expressions.
 *
 * @typeParam T - The expected result type of the expression
 */
export interface ExpressionWrapper<T = unknown> {
  /**
   * Converts this object to a SurrealQL Expression.
   * @returns An Expression representing the SurrealQL statement
   */
  toExpression(): Expression<T>;
}

/**
 * Represents a compiled SQL query with named parameter bindings.
 * Immutable structure containing the final query string and bindings.
 */
export interface Query {
  /** The compiled SQL query string */
  readonly query: string;
  /** Record of parameter names to their values */
  readonly bindings: Record<string, unknown>;
}

/**
 * A fragment that can be part of a SurrealQL query.
 * Can be a raw string, an identifier, a binding, or an expression.
 */
export type SQLFragment = string | Identifier | Binding | Expression;

/**
 * Phantom metadata type for compile-time type safety.
 * This type is never instantiated at runtime but provides type information.
 *
 * @typeParam T - The expected result type
 */
export interface $Expression<T> {
  readonly __type: T;
}

/**
 * A composable SQL expression builder for SurrealDB queries.
 * Supports lazy evaluation, type-safe composition, and automatic parameter binding.
 *
 * @typeParam T - The expected result type of the expression (phantom type)
 *
 * @example
 * ```ts
 * // Create from raw SQL
 * const expr = Expression.raw<User[]>('SELECT * FROM users');
 *
 * // Compose expressions
 * const base = Expression.raw('SELECT * FROM ');
 * const full = base.append(new Identifier('users'));
 *
 * // Get compiled query
 * const { query, bindings } = full.toQuery();
 * ```
 */
export class Expression<T = unknown> {
  /**
   * Entity kind identifier for cross-module type checking.
   * @internal
   */
  public static readonly [ENTITY_KIND] = 'expression';

  /**
   * Phantom type property for compile-time type checking.
   * Never actually assigned at runtime.
   * @internal
   */
  public declare readonly _: $Expression<T>;

  readonly #fragments: SQLFragment[];

  /**
   * Creates a new Expression instance.
   * @param fragments - Initial array of SQL fragments
   */
  public constructor(fragments: SQLFragment[] = []) {
    this.#fragments = [...fragments];
  }

  /**
   * Returns an immutable copy of the SQL fragments composing this expression.
   * @returns A frozen array of fragments
   */
  public get fragments(): readonly SQLFragment[] {
    return Object.freeze([...this.#fragments]);
  }

  /**
   * Appends a new fragment to this expression.
   * @param fragment - The fragment to append
   * @returns This instance for method chaining
   */
  public append(fragment: SQLFragment): this {
    this.#fragments.push(fragment);
    return this;
  }

  /**
   * Appends multiple fragments to this expression.
   * @param fragments - The fragments to append
   * @returns This instance for method chaining
   */
  public appendAll(...fragments: SQLFragment[]): this {
    this.#fragments.push(...fragments);
    return this;
  }

  /**
   * Serializes this expression to a SurrealQL string without bindings.
   * Useful for debugging or when bindings are not needed.
   * @returns The serialized SurrealQL string
   */
  public serialize(): string {
    return this.toQuery().query;
  }

  /**
   * Compiles this expression into a final SQL query with named parameter bindings.
   * Recursively processes all fragments and generates unique binding names.
   *
   * @returns A Query object containing the SQL string and bindings record
   *
   * @example
   * ```ts
   * const expr = new Expression([
   *   'SELECT * FROM users WHERE age > ',
   *   new Binding(18)
   * ]);
   * const { query, bindings } = expr.toQuery();
   * // query: 'SELECT * FROM users WHERE age > $bind__1'
   * // bindings: { bind__1: 18 }
   * ```
   */
  public toQuery(): Query {
    const bindings: Record<string, unknown> = {};
    let query = '';

    for (const fragment of this.#fragments) {
      // Raw string fragments
      if (typeof fragment === 'string') {
        query += fragment;
        continue;
      }

      // Binding fragments - create unique binding name
      if (is(Binding, fragment)) {
        const bindingName = `${BINDING_TOKEN}${getIncrementalID()}`;
        bindings[bindingName] = fragment.getDriverValue();
        query += `${QUERY_PARAM_TOKEN}${bindingName}`;
        continue;
      }

      // Identifier fragments - escape appropriately
      if (is(Identifier, fragment)) {
        query += escapeIdent(fragment.value);
        continue;
      }

      // Nested Expression fragments - merge recursively
      if (is(Expression, fragment)) {
        const nested = fragment.toQuery();
        query += nested.query;
        Object.assign(bindings, nested.bindings);
      }
    }

    return { query, bindings };
  }

  /**
   * Creates an empty Expression instance.
   * @typeParam R - The expected result type
   * @returns A new empty Expression
   */
  public static empty<R = unknown>(): Expression<R> {
    return new Expression<R>([]);
  }

  /**
   * Creates a raw SQL expression without any processing.
   * Use with caution as this bypasses all safety checks.
   *
   * @typeParam R - The expected result type
   * @param sql - The raw SQL string
   * @returns A new Expression containing the raw SQL
   *
   * @example
   * ```ts
   * const expr = Expression.raw('SELECT count() FROM users');
   * ```
   */
  public static raw<R = unknown>(sql: string): Expression<R> {
    return new Expression<R>([sql]);
  }

  /**
   * Joins multiple expressions with a separator.
   *
   * @param expressions - Array of Expression instances to join
   * @param separator - The separator string or Expression (default: ', ')
   * @returns A new Expression containing the joined fragments
   *
   * @example
   * ```ts
   * const fields = [
   *   Expression.raw('name'),
   *   Expression.raw('age'),
   *   Expression.raw('email')
   * ];
   * const joined = Expression.join(fields); // 'name, age, email'
   * const piped = Expression.join(fields, ' | '); // 'name | age | email'
   * ```
   */
  public static join(expressions: Expression[], separator: string | Expression = ', '): Expression {
    const fragments: SQLFragment[] = [];
    const sep = typeof separator === 'string' ? separator : separator.fragments;

    for (let i = 0; i < expressions.length; i++) {
      // Add separator before each element except the first
      if (i > 0) {
        if (typeof sep === 'string') {
          fragments.push(sep);
        } else {
          fragments.push(...sep);
        }
      }

      // Add the expression's fragments
      const expr = expressions[i];
      if (expr) {
        fragments.push(...expr.fragments);
      }
    }

    return new Expression(fragments);
  }
}

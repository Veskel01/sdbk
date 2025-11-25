import { ENTITY_KIND, is } from '../entity';
import { isNullish, isString } from '../runtime';
import { getIncrementalID } from './id-generator';
import { Identifier } from './identifier';
import { Parameter } from './parameter';

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

/**
 * A composable SQL expression builder for SurrealDB queries.
 */
export class SurrealQL<T = unknown> implements SQLConvertible<T> {
  public static readonly [ENTITY_KIND] = 'surrealql';

  private static readonly NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  private static readonly BINDING_TOKEN = 'bind__' as const;

  /**
   * Phantom metadata property for compile-time type checking.
   * @internal
   */
  public declare readonly _: $SQL<T>;

  private readonly _fragments: SQLFragment[] = [];

  public constructor(fragments: SQLFragment[]) {
    this._fragments = fragments;
  }

  /**
   * Returns an immutable array of SQL fragments that compose this query.
   */
  public get fragments(): readonly SQLFragment[] {
    return Object.freeze(this._fragments);
  }

  /**
   * Appends a new fragment to this query expression.
   * @param fragment - The fragment to append
   * @returns This instance for method chaining
   */
  public append(fragment: SQLFragment): this {
    this._fragments.push(fragment);
    return this;
  }

  /**
   * Converts this expression to a SurrealQL instance.
   * Since this is already a SurrealQL instance, returns itself.
   */
  public toSurrealQL(): SurrealQL<T> {
    return this;
  }

  /**
   * Compiles this expression into a final SQL query with named parameter bindings.
   * @returns A Query object containing the SQL string and bindings object
   */
  public toQuery(): Query {
    const bindings: Record<string, unknown> = {};
    let query = '';

    for (const fragment of this._fragments) {
      if (isString(fragment)) {
        query += fragment;
        continue;
      }

      if (is(Parameter, fragment)) {
        const bindingName = `${SurrealQL.BINDING_TOKEN}${getIncrementalID()}`;
        bindings[bindingName] = fragment.getDriverValue();
        query += `${Parameter.TOKEN}${bindingName}`;
        continue;
      }

      if (is(Identifier, fragment)) {
        query += SurrealQL.escapeName(fragment.value);
        continue;
      }

      if (is(SurrealQL, fragment)) {
        const nested = fragment.toQuery();
        query += nested.query;
        Object.assign(bindings, nested.bindings);
        continue;
      }

      if (isSQLConvertible(fragment)) {
        const nested = fragment.toSurrealQL().toQuery();
        query += nested.query;
        Object.assign(bindings, nested.bindings);
      }
    }

    return {
      query,
      bindings
    };
  }

  /**
   * Escapes a name to be used as a SurrealQL identifier.
   * @param name - The name to escape
   * @returns The escaped name
   */
  public static escapeName(name: string): string {
    if (SurrealQL.NAME_REGEX.test(name)) {
      return name;
    }

    return `\`${name.replace(/`/g, '``')}\``;
  }
}

export function isSQLConvertible(value: unknown): value is SQLConvertible {
  return (
    !isNullish(value) &&
    typeof value === 'object' &&
    typeof (value as SQLConvertible).toSurrealQL === 'function'
  );
}

/**
 * Tagged template literal for building type-safe SurrealQL queries.
 * Automatically converts parameters to appropriate SQL fragments.
 *
 * @template T - The expected result type of the query
 * @param strings - The template string parts
 * @param params - The interpolated parameters
 * @returns A SurrealQL expression
 */
export function surql<T = unknown>(
  strings: TemplateStringsArray,
  ...params: unknown[]
): SurrealQL<T> {
  const fragments: SQLFragment[] = [];

  for (let i = 0; i < strings.length; i++) {
    const stringFragment = strings[i];

    if (!isNullish(stringFragment)) {
      fragments.push(stringFragment);
    }

    if (i < params.length) {
      const param = params[i];

      if (isSQLConvertible(param)) {
        fragments.push(param);
        continue;
      }

      if (is(Parameter, param)) {
        fragments.push(param);
        continue;
      }

      if (is(Identifier, param)) {
        fragments.push(param);
        continue;
      }

      fragments.push(new Parameter(param));
    }
  }

  return new SurrealQL(fragments);
}

/**
 * Creates a SQL identifier (e.g., table or column name) that won't be parameterized.
 * @param value - The identifier string
 * @returns An Identifier instance
 */
surql.identifier = (value: string): Identifier => new Identifier(value);

/**
 * Creates a raw SQL fragment without any processing.
 * Use with caution as this bypasses all safety checks.
 * @param raw - The raw SQL string
 * @returns A SurrealQL expression containing the raw SQL
 */
surql.raw = (raw: string): SurrealQL => new SurrealQL([raw]);

/**
 * Joins multiple SQL expressions with a separator.
 * @param expressions - Array of expressions to join
 * @param separator - The separator to use between expressions (default: ', ')
 * @returns A new SurrealQL expression
 */
surql.join = (
  expressions: SQLConvertible[],
  separator: SurrealQL | string = surql.raw(', ')
): SurrealQL => {
  const fragments: SQLFragment[] = [];

  for (let i = 0; i < expressions.length; i++) {
    if (i > 0) {
      if (typeof separator === 'string') {
        fragments.push(separator);
      } else {
        fragments.push(...separator.fragments);
      }
    }
    const expression = expressions[i];
    if (expression) {
      fragments.push(...expression.toSurrealQL().fragments);
    }
  }

  return new SurrealQL(fragments);
};

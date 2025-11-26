import { Binding, type Encoder } from './binding';
import { Expression, type SQLFragment } from './expression';
import { isBinding, isExpression, isExpressionWrapper, isIdentifier } from './guards';
import { Identifier } from './identifier';

/**
 * Processes an interpolated value and returns an SQLFragment.
 */
function processValue(value: unknown): SQLFragment {
  // Handle Identifier
  if (isIdentifier(value)) {
    return value;
  }

  // Handle Binding
  if (isBinding(value)) {
    return value;
  }

  // Handle Expression class
  if (isExpression(value)) {
    return value;
  }

  // Handle ExpressionWrapper (Field, Table, etc.)
  if (isExpressionWrapper(value)) {
    return value.toExpression();
  }

  // Default: wrap as Binding
  return new Binding(value);
}

/**
 * Tagged template literal for building type-safe SurrealQL queries.
 * Automatically handles parameter binding and expression composition.
 *
 * Supports:
 * - Primitive values (automatically bound as parameters)
 * - `Identifier` instances (escaped as identifiers)
 * - `Binding` instances (bound with optional encoding)
 * - `Expression` instances (composed inline)
 * - `ExpressionWrapper` objects (Field, Table, etc. - converted via toExpression())
 *
 * @typeParam T - The expected result type of the query
 * @param strings - The template string parts
 * @param values - The interpolated values
 * @returns An Expression instance ready for compilation
 *
 * @example
 * ```ts
 * // Simple query with parameters
 * const query = surql`SELECT * FROM users WHERE age > ${18}`;
 * const { query, bindings } = query.toQuery();
 * // query: 'SELECT * FROM users WHERE age > $bind__1'
 * // bindings: { bind__1: 18 }
 *
 * // With identifiers
 * const table = surql.identifier('user-data');
 * const query = surql`SELECT * FROM ${table}`;
 * // query: 'SELECT * FROM ⟨user-data⟩'
 *
 * // Composing queries
 * const base = surql`SELECT * FROM users`;
 * const full = surql`${base} LIMIT ${10}`;
 * ```
 */
export function surql<T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Expression<T[]> {
  const fragments: SQLFragment[] = [];

  for (let i = 0; i < strings.length; i++) {
    const stringPart = strings[i];
    if (stringPart) {
      fragments.push(stringPart);
    }

    if (i < values.length) {
      fragments.push(processValue(values[i]));
    }
  }

  return new Expression<T[]>(fragments);
}

/**
 * Creates a raw SQL fragment without any processing.
 * Use with caution as this bypasses all safety checks.
 *
 * @typeParam T - The expected result type
 * @param sql - The raw SQL string
 * @returns An Expression containing the raw SQL
 *
 * @example
 * ```ts
 * const count = surql.raw('SELECT count() FROM users');
 * ```
 */
surql.raw = <T = unknown>(sql: string): Expression<T> => new Expression([sql]);

/**
 * Creates a SQL identifier that will be properly escaped.
 *
 * @param value - The identifier string
 * @returns An Identifier instance
 *
 * @example
 * ```ts
 * const table = surql.identifier('user-data');
 * const query = surql`SELECT * FROM ${table}`;
 * // SELECT * FROM ⟨user-data⟩
 * ```
 */
surql.identifier = (value: string): Identifier => new Identifier(value);

/**
 * Creates a binding with optional custom encoding.
 *
 * @param value - The binding value
 * @param encoder - Optional encoder for value transformation
 * @returns A Binding instance
 *
 * @example
 * ```ts
 * const date = surql.bind(new Date(), {
 *   mapToDriverValue: (v) => v.toISOString()
 * });
 * ```
 */
surql.bind = <T = unknown>(val: T, encoder?: Encoder<T>): Binding<T> => new Binding(val, encoder);

/**
 * Joins multiple expressions with a separator.
 *
 * @param expressions - Array of Expression instances to join
 * @param separator - The separator string or Expression (default: ', ')
 * @returns An Expression with joined fragments
 *
 * @example
 * ```ts
 * const fields = [
 *   surql.raw('name'),
 *   surql.raw('age'),
 *   surql.raw('email')
 * ];
 * const joined = surql.join(fields);
 * // name, age, email
 * ```
 */
surql.join = (expressions: Expression[], separator?: string | Expression): Expression =>
  Expression.join(expressions, separator);

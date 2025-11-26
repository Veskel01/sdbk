import { Expression } from './expression';

/**
 * Type for expression-like values that can be joined.
 * Allows for conditional expression building.
 */
export type ExpressionLike = Expression | null | undefined | false;

/**
 * Joins multiple expressions with a logical operator (AND/OR).
 * Filters out falsy values and empty strings.
 *
 * @param expressions - The expressions to join
 * @param operator - The logical operator ('AND' or 'OR')
 * @returns An Expression representing the joined expressions
 *
 * @example
 * ```ts
 * const andExpr = joinExpressions([expr1, expr2], 'AND');
 * // (expr1 AND expr2)
 * ```
 */
export function joinExpressions<T = unknown>(
  expressions: ExpressionLike[],
  operator: 'AND' | 'OR'
): Expression<T> {
  const validExprs = expressions.filter((e): e is Expression => e instanceof Expression);

  if (validExprs.length === 0) {
    return Expression.empty();
  }

  if (validExprs.length === 1) {
    const first = validExprs[0];
    if (first) {
      return first as Expression<T>;
    }
  }

  const joined = Expression.join(validExprs, ` ${operator} `);
  return new Expression(['(', joined, ')']);
}

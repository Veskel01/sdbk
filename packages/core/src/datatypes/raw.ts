import type { SurqlSerializable } from './interfaces';

/**
 * Raw SurrealQL expression (not escaped).
 *
 * @example
 * ```typescript
 * const expr = raw('time::now()');
 * expr.toSurql(); // 'time::now()'
 * ```
 */
export class RawExpressionImpl implements SurqlSerializable {
  public readonly expression: string;

  public constructor(expression: string) {
    this.expression = expression;
  }

  public toSurql(): string {
    return this.expression;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a raw SurrealQL expression.
 * Use this for expressions that should not be escaped.
 *
 * @param expression - Raw SurrealQL expression
 * @returns RawExpression instance
 *
 * @example
 * ```typescript
 * raw('time::now()')
 * raw('$value + 1')
 * raw('math::sum(scores)')
 * ```
 */
export function raw(expression: string): RawExpressionImpl {
  return new RawExpressionImpl(expression);
}

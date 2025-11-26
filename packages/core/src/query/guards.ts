import { is } from '../meta';
import { isNullish } from '../utils';
import { Binding } from './binding';
import type { ExpressionWrapper } from './expression';
import { Expression } from './expression';
import { Identifier } from './identifier';

/**
 * Checks if a value is an Expression class instance.
 */
export function isExpression(value: unknown): value is Expression {
  return is(Expression, value);
}

/**
 * Checks if a value is an Identifier class instance.
 */
export function isIdentifier(value: unknown): value is Identifier {
  return is(Identifier, value);
}

/**
 * Checks if a value is a Binding class instance.
 */
export function isBinding(value: unknown): value is Binding {
  return is(Binding, value);
}

/**
 * Checks if a value implements the ExpressionWrapper interface (has toExpression method).
 * This is a structural check (duck typing), not an instance check.
 */
export function isExpressionWrapper(value: unknown): value is ExpressionWrapper {
  return (
    !isNullish(value) &&
    typeof value === 'object' &&
    'toExpression' in value &&
    typeof (value as ExpressionWrapper).toExpression === 'function'
  );
}

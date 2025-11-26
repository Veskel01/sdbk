import type { AnyClass } from './types';
import { isNullish, isObject } from './utils';

export const ENTITY_KIND = Symbol.for('entity-kind');

export interface Entity {
  [ENTITY_KIND]: string;
}

export type EntityClass<T = unknown> = AnyClass<T> & { [ENTITY_KIND]: string };

/**
 * Checks if a value is an instance of an entity class.
 * @param value - The value to check.
 * @param type - The entity class to check against.
 * @returns `true` if the value is an instance of the entity class, `false` otherwise.
 */
export function is<T extends EntityClass>(type: T, value: unknown): value is InstanceType<T> {
  if (isNullish(value) || !isObject(value)) {
    return false;
  }

  if (value instanceof type) {
    return true;
  }

  if (!Object.hasOwn(type, ENTITY_KIND)) {
    throw new Error(
      `Class "${type.name ?? '<unknown>'}" doesn't look like a SurrealDB entity. If this is incorrect and the class is provided by SurrealDB query engine, please report this as a bug.`
    );
  }

  const valueConstructor = Object.getPrototypeOf(value)?.constructor;

  if (valueConstructor && ENTITY_KIND in valueConstructor) {
    return valueConstructor[ENTITY_KIND] === type[ENTITY_KIND];
  }

  return false;
}

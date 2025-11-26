import { SYMBOL } from './constants';
import { isNullish } from './util/guards';

export const KIND = Symbol.for(SYMBOL.KIND);

export interface Entity {
  [KIND]: string;
}

export type Class<T> = (abstract new (...args: any[]) => T) | (new (...args: any[]) => T);

export type EntityClass<T = unknown> = Class<T> & { [KIND]: string };

/**
 * Checks if a value is an instance of an entity class.
 * @param value - The value to check.
 * @param type - The entity class to check against.
 * @returns `true` if the value is an instance of the entity class, `false` otherwise.
 */
export function is<T extends EntityClass>(type: T, value: unknown): value is InstanceType<T> {
  if (isNullish(value) || typeof value !== 'object') {
    return false;
  }

  if (value instanceof type) {
    return true;
  }

  if (!Object.hasOwn(type, KIND)) {
    throw new Error(
      `Class "${type.name ?? '<unknown>'}" doesn't look like a SurrealDB entity. If this is incorrect and the class is provided by SurrealDB query engine, please report this as a bug.`
    );
  }

  let cls = Object.getPrototypeOf(type).constructor;

  if (cls) {
    while (cls) {
      if (KIND in cls && cls[KIND] === type[KIND]) {
        return true;
      }

      cls = Object.getPrototypeOf(cls);
    }
  }

  return false;
}

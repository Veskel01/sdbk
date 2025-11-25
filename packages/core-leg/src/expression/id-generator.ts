/**
 * Symbol for storing the generator instance.
 * @internal
 */
const GENERATOR_SYMBOL = Symbol.for('sdbk:id-generator');

/**
 * Interface for the ID generator instance.
 */
interface IDGeneratorInstance {
  counter: number;
}

/**
 * Retrieves or creates the global ID generator instance.
 * @internal
 */
function getGeneratorInstance(): IDGeneratorInstance {
  const globalScope = globalThis as typeof globalThis & {
    [GENERATOR_SYMBOL]?: IDGeneratorInstance;
  };

  if (!globalScope[GENERATOR_SYMBOL]) {
    globalScope[GENERATOR_SYMBOL] = { counter: 0 };
  }

  return globalScope[GENERATOR_SYMBOL];
}

/**
 * Generates a unique incremental ID for parameter bindings.
 * Uses a global singleton to ensure uniqueness across all queries.
 *
 * @returns A unique numeric ID
 *
 * @example
 * const id1 = getIncrementalID(); // 1
 * const id2 = getIncrementalID(); // 2
 */
export function getIncrementalID(): number {
  const instance = getGeneratorInstance();
  instance.counter += 1;
  return instance.counter;
}

/**
 * Resets the ID generator counter to zero.
 * Primarily used for testing to ensure deterministic binding names.
 *
 * @example
 * resetIncrementalID();
 * getIncrementalID(); // returns 1
 */
export function resetIncrementalID(): void {
  const instance = getGeneratorInstance();
  instance.counter = 0;
}

/**
 * Gets the current counter value without incrementing.
 * Useful for debugging or testing.
 *
 * @returns The current counter value
 * @internal
 */
export function getCurrentID(): number {
  const instance = getGeneratorInstance();
  return instance.counter;
}

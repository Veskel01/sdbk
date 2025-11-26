import { ENTITY_KIND } from '../meta';

/**
 * Interface for encoding binding values before they are sent to the driver.
 * Allows custom transformation of values for specific types.
 *
 * @example
 * ```ts
 * const dateEncoder: Encoder<Date> = {
 *   mapToDriverValue: (value) => value.toISOString()
 * };
 * ```
 */
export interface Encoder<T = unknown> {
  /**
   * Maps a value to its driver-compatible representation.
   * @param value - The original value
   * @returns The transformed value for the driver
   */
  mapToDriverValue(value: T): unknown;
}

/**
 * Represents a bound value in a SurrealQL query.
 * Bindings are automatically assigned unique names to prevent SQL injection.
 *
 * @example
 * ```ts
 * const binding = new Binding('John Doe');
 * // Will be bound as $bind__1 with value 'John Doe'
 *
 * // With custom encoder
 * const dateBinding = new Binding(new Date(), dateEncoder);
 * ```
 */
export class Binding<T = unknown> {
  /**
   * Entity kind identifier for cross-module type checking.
   * @internal
   */
  public static readonly [ENTITY_KIND] = 'binding';

  readonly #value: T;
  readonly #encoder?: Encoder<T>;

  /**
   * Creates a new Binding instance.
   * @param value - The binding value
   * @param encoder - Optional encoder for value transformation
   */
  public constructor(value: T, encoder?: Encoder<T>) {
    this.#value = value;
    this.#encoder = encoder;
  }

  /**
   * Gets the raw binding value.
   * @returns The original binding value
   */
  public get value(): T {
    return this.#value;
  }

  /**
   * Gets the driver-compatible value, applying the encoder if present.
   * @returns The transformed value for the database driver
   */
  public getDriverValue(): unknown {
    return this.#encoder?.mapToDriverValue(this.#value) ?? this.#value;
  }

  /**
   * Checks if this binding has an encoder.
   * @returns `true` if an encoder is configured
   */
  public hasEncoder(): boolean {
    return this.#encoder !== undefined;
  }
}

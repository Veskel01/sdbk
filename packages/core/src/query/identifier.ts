import { ENTITY_KIND } from '../meta';

/**
 * Represents a SQL identifier (e.g., table name, column name) in a SurrealQL query.
 * Identifiers are escaped appropriately when compiled to prevent SQL injection
 * and handle special characters.
 *
 * @example
 * ```ts
 * const table = new Identifier('user-data');
 * // Will be escaped as `user-data` or ⟨user-data⟩ in the final query
 * ```
 */
export class Identifier {
  /**
   * Entity kind identifier for cross-module type checking.
   * @internal
   */
  public static readonly [ENTITY_KIND] = 'identifier';

  readonly #value: string;

  /**
   * Creates a new Identifier instance.
   * @param value - The identifier string value
   */
  public constructor(value: string) {
    this.#value = value;
  }

  /**
   * Gets the raw identifier value.
   * @returns The unescaped identifier string
   */
  public get value(): string {
    return this.#value;
  }
}

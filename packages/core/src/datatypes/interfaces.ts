/**
 * Interface for values that can be serialized to SurrealQL.
 */
export interface SurqlSerializable {
  /**
   * Converts the value to its SurrealQL string representation.
   */
  toSurql(): string;
}

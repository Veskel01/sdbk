import type { UUID } from '@sdbk/parser';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB UUID value implementation.
 *
 * @example
 * ```typescript
 * const id = uuid('550e8400-e29b-41d4-a716-446655440000');
 * id.toSurql(); // "u'550e8400-e29b-41d4-a716-446655440000'"
 * ```
 */
export class UUIDImpl implements UUID, SurqlSerializable {
  public readonly value: string;
  public readonly __brand = 'Uuid' as const;

  public constructor(value: string) {
    this.value = value;
  }

  public toSurql(): string {
    return `u'${this.value}'`;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB UUID value.
 *
 * @param value - UUID string (e.g., '550e8400-e29b-41d4-a716-446655440000')
 * @returns Uuid instance
 *
 * @example
 * ```typescript
 * uuid('550e8400-e29b-41d4-a716-446655440000')
 * ```
 */
export function uuid(value: string): UUIDImpl {
  return new UUIDImpl(value);
}

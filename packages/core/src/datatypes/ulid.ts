import type { ULID } from '@sdbk/parser';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB ULID value implementation.
 *
 * @example
 * ```typescript
 * const id = ulid('01ARZ3NDEKTSV4RRFFQ69G5FAV');
 * id.toSurql(); // "ulid('01ARZ3NDEKTSV4RRFFQ69G5FAV')"
 * ```
 */
export class ULIDImpl implements ULID, SurqlSerializable {
  public readonly value: string;
  public readonly __brand = 'Ulid' as const;

  public constructor(value: string) {
    this.value = value;
  }

  public toSurql(): string {
    return `ulid('${this.value}')`;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB ULID value.
 *
 * @param value - ULID string (e.g., '01ARZ3NDEKTSV4RRFFQ69G5FAV')
 * @returns Ulid instance
 *
 * @example
 * ```typescript
 * ulid('01ARZ3NDEKTSV4RRFFQ69G5FAV')
 * ```
 */
export function ulid(value: string): ULIDImpl {
  return new ULIDImpl(value);
}

import type { Datetime } from '@sdbk/parser';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB datetime value implementation.
 *
 * @example
 * ```typescript
 * const dt = datetime(new Date());
 * dt.toSurql(); // "d'2024-01-15T10:30:00.000Z'"
 * ```
 */
export class DatetimeImpl implements Datetime, SurqlSerializable {
  public readonly value: Date;
  public readonly __brand = 'Datetime' as const;

  public constructor(value: Date | string | number) {
    this.value = value instanceof Date ? value : new Date(value);
  }

  public toISOString(): string {
    return this.value.toISOString();
  }

  public toSurql(): string {
    return `d'${this.toISOString()}'`;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB datetime value.
 *
 * @param value - Date object, ISO string, or timestamp
 * @returns Datetime instance
 *
 * @example
 * ```typescript
 * datetime(new Date())
 * datetime('2024-01-15T10:30:00Z')
 * datetime(1705315800000)
 * ```
 */
export function datetime(value: Date | string | number): DatetimeImpl {
  return new DatetimeImpl(value);
}

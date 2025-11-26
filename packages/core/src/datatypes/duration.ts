import type { Duration } from '@sdbk/parser';
import { BRAND } from '../constants';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB duration value implementation.
 *
 * @example
 * ```typescript
 * const d = duration('1h30m');
 * d.toSurql(); // '1h30m'
 * ```
 */
export class DurationImpl<Unit extends string> implements Duration<Unit>, SurqlSerializable {
  public readonly __brand = BRAND.DURATION;
  public readonly unit: Unit;

  public constructor(unit: Unit) {
    this.unit = unit;
  }

  public toSurql(): string {
    return this.unit;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB duration value.
 *
 * @param value - Duration string (e.g., '1h30m', '1d', '1w2d3h')
 * @param unit - Optional unit type for type safety
 * @returns Duration instance
 *
 * @example
 * ```typescript
 * duration('1h30m')              // 1 hour 30 minutes
 * duration('1d')                 // 1 day
 * duration('30s', 'second')      // 30 seconds with unit type
 * duration('1y', 'year')         // 1 year with unit type
 * ```
 */
export function duration<Unit extends string>(unit: Unit): DurationImpl<Unit> {
  return new DurationImpl(unit);
}

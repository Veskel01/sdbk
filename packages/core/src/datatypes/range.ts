import type { Range } from '@sdbk/parser';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB range value implementation.
 *
 * @example
 * ```typescript
 * const r = range(1, 10);
 * r.toSurql(); // '1..10'
 * ```
 */
export class RangeImpl<T = number> implements Range<T>, SurqlSerializable {
  public readonly start: T;
  public readonly end: T;
  public readonly startInclusive: boolean;
  public readonly endInclusive: boolean;
  public readonly __brand = 'Range' as const;

  public constructor(
    start: T,
    end: T,
    options?: { startInclusive?: boolean; endInclusive?: boolean }
  ) {
    this.start = start;
    this.end = end;
    this.startInclusive = options?.startInclusive ?? true;
    this.endInclusive = options?.endInclusive ?? false;
  }

  public toSurql(): string {
    const startOp = this.startInclusive ? '' : '>';
    const endOp = this.endInclusive ? '=' : '';
    return `${this.start}..${startOp}${endOp}${this.end}`;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB range value.
 *
 * @param start - Start of the range
 * @param end - End of the range
 * @param options - Range options (inclusive/exclusive bounds)
 * @returns Range instance
 *
 * @example
 * ```typescript
 * range(1, 10)                              // 1..10 (start inclusive, end exclusive)
 * range(1, 10, { endInclusive: true })      // 1..=10
 * range(1, 10, { startInclusive: false })   // 1>..10
 * ```
 */
export function range<T = number>(
  start: T,
  end: T,
  options?: { startInclusive?: boolean; endInclusive?: boolean }
): RangeImpl<T> {
  return new RangeImpl(start, end, options);
}

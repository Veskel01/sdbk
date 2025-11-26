import type { MultiPointGeometry } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON MultiPoint geometry implementation.
 *
 * @example
 * ```typescript
 * const mp = multiPoint([[0, 0], [1, 1], [2, 2]]);
 * ```
 */
export class MultiPointGeometryImpl implements MultiPointGeometry, SurqlSerializable {
  public readonly type = 'MultiPoint' as const;
  public readonly coordinates: [number, number][];

  public constructor(coordinates: [number, number][]) {
    this.coordinates = coordinates;
  }

  public toSurql(): string {
    return JSON.stringify({ type: this.type, coordinates: this.coordinates });
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a GeoJSON MultiPoint geometry.
 *
 * @param coordinates - Array of [longitude, latitude] pairs
 * @returns MultiPointGeometry instance
 *
 * @example
 * ```typescript
 * multiPoint([[0, 0], [1, 1], [2, 2]])
 * ```
 */
export function multiPoint(coordinates: [number, number][]): MultiPointGeometryImpl {
  return new MultiPointGeometryImpl(coordinates);
}

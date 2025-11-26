import type { LineStringGeometry } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON LineString geometry implementation.
 *
 * @example
 * ```typescript
 * const ls = lineString([[0, 0], [1, 1], [2, 0]]);
 * ```
 */
export class LineStringGeometryImpl implements LineStringGeometry, SurqlSerializable {
  public readonly type = 'LineString' as const;
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
 * Creates a GeoJSON LineString geometry.
 *
 * @param coordinates - Array of [longitude, latitude] pairs
 * @returns LineStringGeometry instance
 *
 * @example
 * ```typescript
 * lineString([[0, 0], [1, 1], [2, 0]])
 * ```
 */
export function lineString(coordinates: [number, number][]): LineStringGeometryImpl {
  return new LineStringGeometryImpl(coordinates);
}

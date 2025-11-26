import type { MultiPolygonGeometry } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON MultiPolygon geometry implementation.
 *
 * @example
 * ```typescript
 * const mpg = multiPolygon([
 *   [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
 *   [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]
 * ]);
 * ```
 */
export class MultiPolygonGeometryImpl implements MultiPolygonGeometry, SurqlSerializable {
  public readonly type = 'MultiPolygon' as const;
  public readonly coordinates: [number, number][][][];

  public constructor(coordinates: [number, number][][][]) {
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
 * Creates a GeoJSON MultiPolygon geometry.
 *
 * @param coordinates - Array of polygons
 * @returns MultiPolygonGeometry instance
 *
 * @example
 * ```typescript
 * multiPolygon([
 *   [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
 *   [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]
 * ])
 * ```
 */
export function multiPolygon(coordinates: [number, number][][][]): MultiPolygonGeometryImpl {
  return new MultiPolygonGeometryImpl(coordinates);
}

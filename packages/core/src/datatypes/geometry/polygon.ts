import type { PolygonGeometry } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON Polygon geometry implementation.
 *
 * @example
 * ```typescript
 * const pg = polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
 * ```
 */
export class PolygonGeometryImpl implements PolygonGeometry, SurqlSerializable {
  public readonly type = 'Polygon' as const;
  public readonly coordinates: [number, number][][];

  public constructor(coordinates: [number, number][][]) {
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
 * Creates a GeoJSON Polygon geometry.
 *
 * @param coordinates - Array of linear rings (first is exterior, rest are holes)
 * @returns PolygonGeometry instance
 *
 * @example
 * ```typescript
 * // Simple polygon (square)
 * polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]])
 *
 * // Polygon with hole
 * polygon([
 *   [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],  // exterior
 *   [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]]       // hole
 * ])
 * ```
 */
export function polygon(coordinates: [number, number][][]): PolygonGeometryImpl {
  return new PolygonGeometryImpl(coordinates);
}

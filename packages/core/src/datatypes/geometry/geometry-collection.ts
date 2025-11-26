import type { Geometry, GeometryCollection } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON GeometryCollection implementation.
 *
 * @example
 * ```typescript
 * const gc = geometryCollection([
 *   point([0, 0]),
 *   lineString([[0, 0], [1, 1]])
 * ]);
 * ```
 */
export class GeometryCollectionImpl implements GeometryCollection, SurqlSerializable {
  public readonly type = 'GeometryCollection' as const;
  public readonly geometries: Geometry[];

  public constructor(geometries: Geometry[]) {
    this.geometries = geometries;
  }

  public toSurql(): string {
    const geoms = this.geometries.map((g) => {
      if ('toSurql' in g && typeof g.toSurql === 'function') {
        return JSON.parse(g.toSurql());
      }
      return g;
    });
    return JSON.stringify({ type: this.type, geometries: geoms });
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a GeoJSON GeometryCollection.
 *
 * @param geometries - Array of geometry objects
 * @returns GeometryCollection instance
 *
 * @example
 * ```typescript
 * geometryCollection([
 *   point([0, 0]),
 *   lineString([[0, 0], [1, 1]])
 * ])
 * ```
 */
export function geometryCollection(geometries: Geometry[]): GeometryCollectionImpl {
  return new GeometryCollectionImpl(geometries);
}

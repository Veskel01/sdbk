import type { PointGeometry } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON Point geometry implementation.
 *
 * @example
 * ```typescript
 * const p = point([12.34, 56.78]);
 * p.toSurql(); // '{ type: "Point", coordinates: [12.34, 56.78] }'
 * ```
 */
export class PointGeometryImpl implements PointGeometry, SurqlSerializable {
  public readonly type = 'Point' as const;
  public readonly coordinates: [number, number];

  public constructor(coordinates: [number, number]) {
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
 * Creates a GeoJSON Point geometry.
 *
 * @param coordinates - [longitude, latitude]
 * @returns PointGeometry instance
 *
 * @example
 * ```typescript
 * point([12.34, 56.78])
 * ```
 */
export function point(...coordinates: [number, number]): PointGeometryImpl {
  return new PointGeometryImpl(coordinates);
}

import type { MultiLineStringGeometry } from '@sdbk/parser';
import type { SurqlSerializable } from '../interfaces';

/**
 * GeoJSON MultiLineString geometry implementation.
 *
 * @example
 * ```typescript
 * const mls = multiLineString([
 *   [[0, 0], [1, 1]],
 *   [[2, 2], [3, 3]]
 * ]);
 * ```
 */
export class MultiLineStringGeometryImpl implements MultiLineStringGeometry, SurqlSerializable {
  public readonly type = 'MultiLineString' as const;
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
 * Creates a GeoJSON MultiLineString geometry.
 *
 * @param coordinates - Array of line strings
 * @returns MultiLineStringGeometry instance
 *
 * @example
 * ```typescript
 * multiLineString([
 *   [[0, 0], [1, 1]],
 *   [[2, 2], [3, 3]]
 * ])
 * ```
 */
export function multiLineString(coordinates: [number, number][][]): MultiLineStringGeometryImpl {
  return new MultiLineStringGeometryImpl(coordinates);
}

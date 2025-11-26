import { geometryCollection } from './geometry/geometry-collection';
import { lineString } from './geometry/line-string';
import { multiLineString } from './geometry/multi-line-string';
import { multiPoint } from './geometry/multi-point';
import { multiPolygon } from './geometry/multi-polygon';
import { point } from './geometry/point';
import { polygon } from './geometry/polygon';

export * from './bytes';
export * from './datetime';
export * from './duration';
export * from './interfaces';
export * from './range';
export * from './raw';
export * from './record-id';
export * from './ulid';
export * from './uuid';

export const geometry = {
  collection: geometryCollection,
  lineString,
  multiLineString,
  multiPoint,
  multiPolygon,
  point,
  polygon
};

import type { Brand } from '../utils';
import type { GeometrySubtype, PrimitiveType } from './data-type';

/**
 * SurrealDB duration value.
 *
 * @example
 * Duration format: `1h30m`, `1d`, `1w2d3h`, etc.
 * Units: y, w, d, h, m, s, ms, us/µs, ns
 */
export interface Duration<Unit extends string = string> extends Brand<'Duration'> {
  readonly unit: Unit;
}

/**
 * SurrealDB UUID value.
 */
export interface UUID extends Brand<'Uuid'> {
  readonly value: string;
}

/**
 * SurrealDB ULID value.
 */
export interface ULID extends Brand<'Ulid'> {
  readonly value: string;
}

/**
 * SurrealDB bytes/binary value.
 */
export interface Bytes extends Brand<'Bytes'> {
  readonly value: Uint8Array;
}

/**
 * SurrealDB datetime value.
 */
export interface Datetime extends Brand<'Datetime'> {
  readonly value: Date;
}

/**
 * SurrealDB range value.
 */
export interface Range<T = number> extends Brand<'Range'> {
  readonly start: T;
  readonly end: T;
  readonly startInclusive?: boolean;
  readonly endInclusive?: boolean;
}

/**
 * SurrealDB record ID (table:id).
 *
 * @example
 * Simple ID: `user:john`
 * Numeric ID: `user:123`
 * Complex ID: `user:['compound', 'key']`
 */
export interface RecordId<TTable extends string = string> extends Brand<'RecordId'> {
  readonly table: TTable;
  readonly id: string | number | object;
}

/**
 * Capitalizes geometry subtype to GeoJSON type name.
 */
type CapitalizeGeometry<S extends string> = S extends 'linestring'
  ? 'LineString'
  : S extends 'multipoint'
    ? 'MultiPoint'
    : S extends 'multilinestring'
      ? 'MultiLineString'
      : S extends 'multipolygon'
        ? 'MultiPolygon'
        : S extends 'collection'
          ? 'GeometryCollection'
          : Capitalize<S>;

/**
 * Maps SurrealQL geometry subtype to GeoJSON type name.
 */
export type GeometrySubtypeMap = {
  [K in GeometrySubtype]: CapitalizeGeometry<K>;
};

/**
 * GeoJSON geometry type literal names.
 * Derived from GeometrySubtype mapping.
 */
export type GeometryTypeLiteral = GeometrySubtypeMap[keyof GeometrySubtypeMap];

/**
 * Base GeoJSON geometry interface.
 */
export interface Geometry<TType extends GeometryTypeLiteral = GeometryTypeLiteral> {
  readonly type: TType;
  readonly coordinates?: unknown;
  readonly geometries?: Geometry[];
}

/**
 * Point geometry - single coordinate pair [longitude, latitude].
 */
export interface PointGeometry extends Geometry<'Point'> {
  readonly coordinates: [number, number];
}

/**
 * LineString geometry - array of coordinate pairs.
 */
export interface LineStringGeometry extends Geometry<'LineString'> {
  readonly coordinates: [number, number][];
}

/**
 * Polygon geometry - array of linear rings.
 */
export interface PolygonGeometry extends Geometry<'Polygon'> {
  readonly coordinates: [number, number][][];
}

/**
 * MultiPoint geometry - multiple points.
 */
export interface MultiPointGeometry extends Geometry<'MultiPoint'> {
  readonly coordinates: [number, number][];
}

/**
 * MultiLineString geometry - multiple line strings.
 */
export interface MultiLineStringGeometry extends Geometry<'MultiLineString'> {
  readonly coordinates: [number, number][][];
}

/**
 * MultiPolygon geometry - multiple polygons.
 */
export interface MultiPolygonGeometry extends Geometry<'MultiPolygon'> {
  readonly coordinates: [number, number][][][];
}

/**
 * GeometryCollection - collection of different geometries.
 */
export interface GeometryCollection extends Geometry<'GeometryCollection'> {
  readonly geometries: Geometry[];
}

/**
 * Union of all geometry types.
 */
export type AnyGeometry =
  | PointGeometry
  | LineStringGeometry
  | PolygonGeometry
  | MultiPointGeometry
  | MultiLineStringGeometry
  | MultiPolygonGeometry
  | GeometryCollection;

/**
 * Maps SurrealQL primitive type names to their corresponding TypeScript types.
 *
 * @remarks
 * This interface provides the mapping between SurrealQL's primitive type system and TypeScript.
 *
 * @see {@link https://surrealdb.com/docs/surrealql/datamodel | SurrealDB Data Model}
 */
export interface PrimitiveTypeMap extends Record<PrimitiveType, unknown> {
  any: unknown;
  bool: boolean;
  bytes: Bytes;
  datetime: Datetime;
  decimal: number;
  duration: Duration;
  float: number;
  int: number;
  number: number;
  object: Record<string, unknown>;
  string: string;
  uuid: UUID;
  ulid: ULID;
}

/**
 * Maps SurrealQL collection/container type names to their TypeScript representations.
 * These are generic types that wrap other types.
 *
 * @remarks
 * - `array<T>` and `set<T>` both map to `T[]` (SurrealDB returns sets as arrays)
 * - `option<T>` maps to `T | null`
 *
 * Note: These types require parameters in practice. The base types here represent
 * the unparameterized form (e.g., just `array` without `<T>`).
 */
export interface CollectionTypeMap {
  array: unknown[];
  set: unknown[];
  option: unknown | null;
}

/**
 * Maps SurrealQL special type names to their TypeScript representations.
 */
export interface SpecialTypeMap {
  record: RecordId;
  range: Range;
  geometry: AnyGeometry;
  literal: string | number | boolean;
  null: null;
}

/**
 * Maps geometry subtypes to their specific TypeScript geometry interfaces.
 */
export interface GeometryTypeMap {
  point: PointGeometry;
  linestring: LineStringGeometry;
  polygon: PolygonGeometry;
  multipoint: MultiPointGeometry;
  multilinestring: MultiLineStringGeometry;
  multipolygon: MultiPolygonGeometry;
  collection: GeometryCollection;
}

/**
 * Complete type map combining all SurrealQL types.
 *
 * @see {@link https://surrealdb.com/docs/surrealql/datamodel | SurrealDB Data Model}
 */
export type TypeMap = PrimitiveTypeMap & CollectionTypeMap & SpecialTypeMap & GeometryTypeMap;

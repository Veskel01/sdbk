import type { DurationSubtype, GeometrySubtype, ScalarDef } from './type-def';

/**
 * Maps SurrealQL geometry subtype to GeoJSON type name.
 */
type GeometryTypeName<S extends GeometrySubtype> = S extends 'linestring'
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
 * GeoJSON geometry type literal names.
 */
export type GeometryTypeNames = {
  [K in GeometrySubtype]: GeometryTypeName<K>;
};

/**
 * Union of all GeoJSON geometry type names.
 */
export type GeometryTypeLiteral = GeometryTypeNames[keyof GeometryTypeNames];

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
export interface GeometryCollectionGeometry extends Geometry<'GeometryCollection'> {
  readonly geometries: Geometry[];
}

/**
 * Union of all specific geometry types.
 */
export type AnyGeometry =
  | PointGeometry
  | LineStringGeometry
  | PolygonGeometry
  | MultiPointGeometry
  | MultiLineStringGeometry
  | MultiPolygonGeometry
  | GeometryCollectionGeometry;

/**
 * Record ID type - represents a reference to a table row.
 * Format: `table:id` where id can be various formats.
 *
 * @typeParam T - The table name(s) this record can reference
 *
 * @example
 * ```typescript
 * type UserId = RecordId<'user'>;        // 'user:...'
 * type AnyId = RecordId;                  // 'table:...'
 * type MultiId = RecordId<'user' | 'post'>; // 'user:...' | 'post:...'
 * ```
 */
export type RecordId<T extends string = string> = `${T}:${string}`;

/**
 * Range type - represents a bounded range of values.
 * Ranges in SurrealDB use syntax like `0..10`, `0..=10`, `0>..10`
 *
 * @see https://surrealdb.com/docs/surrealql/datamodel/ranges
 *
 * @typeParam T - The type of values in the range (any comparable type)
 *
 * @example
 * ```
 * 0..10      // beg=0, end=10, begInclusive=true, endInclusive=false
 * 0..=10     // beg=0, end=10, begInclusive=true, endInclusive=true
 * 0>..10     // beg=0, end=10, begInclusive=false, endInclusive=false
 * 0>..=10    // beg=0, end=10, begInclusive=false, endInclusive=true
 * 0..        // beg=0, end=null (open-ended)
 * ..10       // beg=null, end=10 (open-ended)
 * ..         // beg=null, end=null (infinite range)
 * ```
 */
export interface Range<T = unknown> {
  /** Start of range, null if open-ended */
  readonly beg: T | null;
  /** End of range, null if open-ended */
  readonly end: T | null;
  /** Whether start is inclusive (true) or exclusive (false, uses >) */
  readonly begInclusive: boolean;
  /** Whether end is inclusive (true, uses =) or exclusive (false, default) */
  readonly endInclusive: boolean;
}

/**
 * Duration type - represents a time duration.
 * Stored as ISO 8601 duration string or nanoseconds.
 *
 * @typeParam T - Optional duration subtype for precision hint
 */
export type Duration<T extends DurationSubtype | string = string> = string & {
  readonly __duration?: T;
};

/**
 * Maps SurrealQL scalar type names to TypeScript types.
 */
export interface ScalarMap extends Record<ScalarDef, unknown> {
  any: unknown;
  bool: boolean;
  bytes: Uint8Array;
  datetime: Date;
  decimal: number;
  duration: Duration;
  float: number;
  int: number;
  number: number;
  null: null;
  object: Record<string, unknown>;
  string: string;
  uuid: string;
  ulid: string;
}

/**
 * Maps SurrealQL collection wrapper types to TypeScript.
 * Note: SurrealDB returns sets as arrays.
 */
export interface CollectionMap {
  array: unknown[];
  set: unknown[];
  option: unknown | null;
}

/**
 * Maps SurrealQL special types to TypeScript.
 */
export interface SpecialMap {
  record: RecordId;
  range: Range;
  geometry: AnyGeometry;
  literal: string | number | boolean;
}

/**
 * Maps geometry subtypes to their specific TypeScript interfaces.
 */
export interface GeometryMap {
  point: PointGeometry;
  linestring: LineStringGeometry;
  polygon: PolygonGeometry;
  multipoint: MultiPointGeometry;
  multilinestring: MultiLineStringGeometry;
  multipolygon: MultiPolygonGeometry;
  collection: GeometryCollectionGeometry;
}

/**
 * Complete type map combining all SurrealQL types.
 */
export type TypeMap = ScalarMap & CollectionMap & SpecialMap & GeometryMap;

/**
 * Exported types for external use and test compatibility.
 */
export type Bytes = Uint8Array;
export type Datetime = Date;
export type UUID = string;
export type ULID = string;
export type GeometryCollection = GeometryCollectionGeometry;

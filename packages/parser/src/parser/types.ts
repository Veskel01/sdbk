import type { PrimitiveType } from '../schema';

/**
 * Maps SurrealQL type names to their corresponding TypeScript types.
 *
 * @remarks
 * This interface provides the mapping between SurrealQL's type system and TypeScript.
 * It covers all primitive types, date/time types, identifiers, binary data, and complex types.
 * Keys are aligned with {@link PrimitiveType} from data-type.ts.
 *
 * @see {@link https://surrealdb.com/docs/surrealql/datamodel | SurrealDB Data Model}
 *
 * @example
 * ```typescript
 * // Access mapped types directly
 * type StringType = TypeMap['string']; // string
 * type IntType = TypeMap['int'];       // number
 * type DateType = TypeMap['datetime']; // Date
 * ```
 */
export interface TypeMap extends Record<PrimitiveType, unknown> {
  /** String primitive type */
  string: string;
  /** 64-bit signed integer, mapped to number */
  int: number;
  /** 64-bit floating point, mapped to number */
  float: number;
  /** Generic number type */
  number: number;
  /** Arbitrary precision decimal, mapped to number */
  decimal: number;
  /** Boolean type */
  bool: boolean;
  /** ISO 8601 datetime, mapped to Date */
  datetime: Date;
  /** Duration type with branded subtype */
  duration: Duration;
  /** UUID v4/v7 string */
  uuid: string;
  /** ULID string */
  ulid: string;
  /** Binary data */
  bytes: Uint8Array;
  /** Generic object/map type */
  object: Record<string, unknown>;
  /** Any type, maps to unknown for type safety */
  any: unknown;
  /** Record ID without table parameter */
  record: RecordId;
  /** Literal/enum type (without parameter) */
  literal: string | number | boolean;
  /** Array of record references */
  references: RecordId[];
}

/**
 * Represents a SurrealDB Record ID with typed table reference.
 *
 * @remarks
 * Record IDs in SurrealDB follow the format `table:id` (e.g., `user:john`, `post:ulid()`).
 * This interface uses branded types to preserve table name information at compile time.
 *
 * @typeParam Table - The table name this record belongs to
 *
 * @see {@link https://surrealdb.com/docs/surrealql/datamodel/ids | SurrealDB Record IDs}
 *
 * @example
 * ```typescript
 * type UserRecord = RecordId<'user'>;
 * type PostRecord = RecordId<'post'>;
 *
 * // Union of record types
 * type ContentRecord = RecordId<'user'> | RecordId<'post'>;
 * ```
 */
export interface RecordId<Table extends string = string> {
  /** Branded property storing the table name */
  readonly __table: Table;
  /** The unique identifier within the table */
  readonly __id: string;
}

/**
 * Alias for {@link RecordId} representing a typed record link.
 *
 * @typeParam Table - The table name this link references
 *
 * @see {@link https://surrealdb.com/docs/surrealql/datamodel/records | SurrealDB Records}
 */
export type RecordLink<Table extends string = string> = RecordId<Table>;

/**
 * Branded type for SurrealDB duration values with optional subtype.
 *
 * @remarks
 * Duration subtypes include: `year`, `month`, `week`, `day`, `hour`, `minute`, `second`, `millisecond`, `microsecond`, `nanosecond`.
 *
 * @typeParam Subtype - The duration unit (e.g., 'year', 'day', 'hour')
 *
 * @example
 * ```typescript
 * type YearDuration = Duration<'year'>;
 * type DayDuration = Duration<'day'>;
 * ```
 */
export type Duration<Subtype extends string = string> = string & {
  readonly __duration: true;
  readonly __subtype: Subtype;
};

// ============================================================================
// GeoJSON Types
// ============================================================================

/**
 * Base GeoJSON geometry interface for SurrealDB spatial types.
 *
 * @see {@link https://surrealdb.com/docs/surrealql/datamodel/geometries | SurrealDB Geometries}
 */
export interface GeoJSON {
  /** The geometry type */
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon'
    | 'GeometryCollection';
  /** Geometry coordinates (format depends on type) */
  coordinates: unknown;
}

/**
 * GeoJSON Point geometry - a single position.
 *
 * @example
 * ```typescript
 * const point: PointGeometry = {
 *   type: 'Point',
 *   coordinates: [longitude, latitude]
 * };
 * ```
 */
export interface PointGeometry {
  type: 'Point';
  /** [longitude, latitude] */
  coordinates: [number, number];
}

/**
 * GeoJSON LineString geometry - a connected sequence of points.
 */
export interface LineStringGeometry {
  type: 'LineString';
  /** Array of [longitude, latitude] positions */
  coordinates: [number, number][];
}

/**
 * GeoJSON Polygon geometry - a closed shape with optional holes.
 */
export interface PolygonGeometry {
  type: 'Polygon';
  /** Array of linear rings (first is exterior, rest are holes) */
  coordinates: [number, number][][];
}

/**
 * GeoJSON MultiPoint geometry - multiple points.
 */
export interface MultiPointGeometry {
  type: 'MultiPoint';
  /** Array of [longitude, latitude] positions */
  coordinates: [number, number][];
}

/**
 * GeoJSON MultiLineString geometry - multiple line strings.
 */
export interface MultiLineStringGeometry {
  type: 'MultiLineString';
  /** Array of line strings */
  coordinates: [number, number][][];
}

/**
 * GeoJSON MultiPolygon geometry - multiple polygons.
 */
export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  /** Array of polygons */
  coordinates: [number, number][][][];
}

/**
 * GeoJSON GeometryCollection - a collection of different geometry types.
 */
export interface GeometryCollectionGeometry {
  type: 'GeometryCollection';
  /** Array of geometry objects */
  geometries: GeoJSON[];
}

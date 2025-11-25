import type { FirstWord, Trim, Upper } from '../utils';
import type { ParseErrors } from './errors';

/**
 * Maps SurrealQL type names to their corresponding TypeScript types.
 *
 * @remarks
 * This interface provides the mapping between SurrealQL's type system and TypeScript.
 * It covers all primitive types, date/time types, identifiers, binary data, and complex types.
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
export interface TypeMap {
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
  /** Literal/enum type */
  literal: unknown;
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

/**
 * Parses a SurrealQL type string and returns the corresponding TypeScript type.
 *
 * @remarks
 * This type performs compile-time parsing of SurrealQL type definitions and maps them
 * to their TypeScript equivalents. It supports nested types up to 10 levels deep.
 *
 * **Supported types:**
 * - Primitives: `string`, `int`, `float`, `number`, `decimal`, `bool`
 * - Date/Time: `datetime`, `duration`, `duration<subtype>`
 * - Collections: `array<T>`, `set<T>`, `option<T>`
 * - Records: `record`, `record<table>`, `record<table1|table2>`
 * - Spatial: `geometry`, `geometry<point>`, `geometry<polygon>`, etc.
 * - Special: `range<T>`, `bytes`, `uuid`, `ulid`, `object`, `any`
 *
 * @typeParam S - The SurrealQL type string to parse
 *
 * @example
 * ```typescript
 * // Primitive types
 * type Str = ParseType<'string'>;           // string
 * type Num = ParseType<'int'>;              // number
 *
 * // Collection types
 * type Arr = ParseType<'array<string>'>;    // string[]
 * type Opt = ParseType<'option<int>'>;      // number | null
 * type ArrOpt = ParseType<'array<option<string>>'>; // (string | null)[]
 *
 * // Record types
 * type Rec = ParseType<'record<user>'>;     // RecordId<'user'>
 * type Union = ParseType<'record<user|post>'>; // RecordId<'user'> | RecordId<'post'>
 *
 * // Geometry types
 * type Point = ParseType<'geometry<point>'>; // PointGeometry
 *
 * // Duration types
 * type Dur = ParseType<'duration<day>'>;    // Duration<'day'>
 * ```
 */
export type ParseType<S extends string> = _MapType<Trim<S>, 0>;

/**
 * Internal type mapper with depth tracking for recursion prevention.
 * Optimized with early returns for common types.
 */
type _MapType<S extends string, Depth extends number = 0> = Depth extends 10
  ? ParseErrors.TypeDepthExceeded
  : // Fast path for common primitive types (no recursion needed)
    _FastMap<Lowercase<S>> extends infer Fast
    ? [Fast] extends [never]
      ? _MapComplex<S, Depth>
      : Fast
    : _MapComplex<S, Depth>;

/**
 * Fast lookup for simple types without generic parameters.
 * Performance optimization: avoids complex pattern matching for common cases.
 */
type _FastMap<S extends string> = S extends keyof TypeMap ? TypeMap[S] : never;

/**
 * Complex type mapping for generic/parameterized types.
 */
type _MapComplex<S extends string, Depth extends number> = Upper<S> extends `ARRAY<${
  string // Array types: array<T> or array<T, N>
}>`
  ? _MapType<_Inner<S>, _Inc<Depth>>[]
  : Upper<S> extends `ARRAY<${string}>${string}`
    ? _MapType<_Inner<S>, _Inc<Depth>>[]
    : // Set types: set<T> or set<T, N>
      Upper<S> extends `SET<${string}>`
      ? Set<_MapType<_Inner<S>, _Inc<Depth>>>
      : Upper<S> extends `SET<${string}>${string}`
        ? Set<_MapType<_Inner<S>, _Inc<Depth>>>
        : // Option types: option<T> (nullable)
          Upper<S> extends `OPTION<${string}>`
          ? _MapType<_Inner<S>, _Inc<Depth>> | null
          : Upper<S> extends `OPTION<${string}>${string}`
            ? _MapType<_Inner<S>, _Inc<Depth>> | null
            : // Record types: record<table> or record<table|table2>
              Upper<S> extends `RECORD<${infer Table}>`
              ? _ExtractTableName<Table>
              : Upper<S> extends `RECORD<${infer Table}>${string}`
                ? _ExtractTableName<Table>
                : // Range types: range<T>
                  Upper<S> extends `RANGE<${string}>`
                  ? [number, number]
                  : Upper<S> extends `RANGE<${string}>${string}`
                    ? [number, number]
                    : // Duration types: duration<subtype>
                      Upper<S> extends `DURATION<${infer Subtype}>`
                      ? Duration<Lowercase<Trim<Subtype>>>
                      : Upper<S> extends `DURATION<${string}>${string}`
                        ? Duration<string>
                        : // Geometry types: geometry<subtype>
                          Upper<S> extends `GEOMETRY<${infer Subtype}>`
                          ? _MapGeometrySubtype<Lowercase<Trim<Subtype>>>
                          : Upper<S> extends `GEOMETRY<${string}>${string}`
                            ? GeoJSON
                            : // Plain 'record' without parameter
                              Upper<S> extends 'RECORD'
                              ? RecordId
                              : // Fallback to basic type lookup
                                _Map<Lowercase<FirstWord<S>>>;

/**
 * Extracts table name(s) from record type parameter.
 * Supports union types: `record<user|post>` → `RecordId<'user'> | RecordId<'post'>`
 */
type _ExtractTableName<S extends string> = _SplitTableNames<Trim<S>>;

/**
 * Recursively splits table names by pipe separator and creates a union type.
 */
type _SplitTableNames<S extends string> = S extends `${infer First}|${infer Rest}`
  ? RecordId<Lowercase<Trim<First>>> | _SplitTableNames<Rest>
  : RecordId<Lowercase<Trim<S>>>;

/**
 * Extracts the inner type parameter from a generic type.
 * Example: `array<string>` → `string`
 */
type _Inner<S extends string> = S extends `${string}<${infer Rest}`
  ? _ExtractBalanced<Rest, '', 1>
  : never;

/**
 * Extracts balanced content between angle brackets.
 * Handles nested generics correctly.
 */
type _ExtractBalanced<
  S extends string,
  Acc extends string,
  Depth extends number
> = S extends `${infer Char}${infer Rest}`
  ? Char extends '<'
    ? _ExtractBalanced<Rest, `${Acc}<`, _Inc<Depth>>
    : Char extends '>'
      ? Depth extends 1
        ? _StripExtraParams<Acc>
        : _ExtractBalanced<Rest, `${Acc}>`, _Dec<Depth>>
      : _ExtractBalanced<Rest, `${Acc}${Char}`, Depth>
  : Acc;

/**
 * Strips extra parameters from type parameter (e.g., max length in `array<string, 100>`).
 * Only the first type parameter is used; additional parameters are ignored.
 */
type _StripExtraParams<S extends string> = _StripAtLevel<S, '', 0>;

/**
 * Helper for stripping parameters at the correct nesting level.
 */
type _StripAtLevel<
  S extends string,
  Acc extends string,
  Depth extends number
> = S extends `${infer Char}${infer Rest}`
  ? Char extends '<'
    ? _StripAtLevel<Rest, `${Acc}<`, _Inc<Depth>>
    : Char extends '>'
      ? _StripAtLevel<Rest, `${Acc}>`, _Dec<Depth>>
      : Char extends ','
        ? Depth extends 0
          ? Trim<Acc>
          : _StripAtLevel<Rest, `${Acc},`, Depth>
        : _StripAtLevel<Rest, `${Acc}${Char}`, Depth>
  : Trim<Acc>;

/** Increment depth counter (max 10) */
type _Inc<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10][N];

/** Decrement depth counter (min 0) */
type _Dec<N extends number> = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9][N];

/** Maps type name to TypeMap entry, returns `unknown` for unrecognized types */
type _Map<T extends string> = T extends keyof TypeMap ? TypeMap[T] : unknown;

/**
 * Maps geometry subtype string to specific geometry interface.
 */
type _MapGeometrySubtype<S extends string> = S extends 'point'
  ? PointGeometry
  : S extends 'linestring'
    ? LineStringGeometry
    : S extends 'polygon'
      ? PolygonGeometry
      : S extends 'multipoint'
        ? MultiPointGeometry
        : S extends 'multilinestring'
          ? MultiLineStringGeometry
          : S extends 'multipolygon'
            ? MultiPolygonGeometry
            : S extends 'geometrycollection'
              ? GeometryCollectionGeometry
              : GeoJSON;

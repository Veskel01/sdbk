import type { FirstWord, Trim, Upper } from '../utils';

/**
 * Maps SurrealQL type names to TypeScript types.
 * @see https://surrealdb.com/docs/surrealql/datamodel
 */
export interface TypeMap {
  // Primitives
  string: string;
  int: number;
  float: number;
  number: number;
  decimal: number;
  bool: boolean;
  // Date/Time
  datetime: Date;
  duration: string;
  // Identifiers
  uuid: string;
  ulid: string;
  // Binary
  bytes: Uint8Array;
  // Complex
  object: Record<string, unknown>;
  any: unknown;
  // Record (without generic parameter)
  record: RecordId;
  // Literal types
  literal: unknown;
  // References
  references: RecordId[];
}

/**
 * Represents a SurrealDB Record ID.
 * Format: "table:id" (e.g., "user:john", "post:ulid()")
 * @see https://surrealdb.com/docs/surrealql/datamodel/ids
 */
export interface RecordId<Table extends string = string> {
  readonly __table: Table;
  readonly __id: string;
}

/**
 * Represents a typed record link to a specific table.
 * @see https://surrealdb.com/docs/surrealql/datamodel/records
 */
export type RecordLink<Table extends string = string> = RecordId<Table>;

/**
 * GeoJSON geometry types supported by SurrealDB.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export interface GeoJSON {
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon'
    | 'GeometryCollection';
  coordinates: unknown;
}

/**
 * Parse a SurrealQL type string to TypeScript type.
 *
 * @example
 * ```typescript
 * type Result = ParseType<'array<string>'>; // string[]
 * type Result2 = ParseType<'option<int>'>; // number | null
 * type Result3 = ParseType<'record<user>'>; // RecordId<'user'>
 * ```
 */
export type ParseType<S extends string> = _MapType<Trim<S>>;

type _MapType<S extends string> =
  // Array types: array<T>
  Upper<S> extends `ARRAY<${string}>`
    ? _MapType<_Inner<S>>[]
    : Upper<S> extends `ARRAY<${string}>${string}`
      ? _MapType<_Inner<S>>[]
      : // Set types: set<T>
        Upper<S> extends `SET<${string}>`
        ? Set<_MapType<_Inner<S>>>
        : Upper<S> extends `SET<${string}>${string}`
          ? Set<_MapType<_Inner<S>>>
          : // Option types: option<T> (nullable)
            Upper<S> extends `OPTION<${string}>`
            ? _MapType<_Inner<S>> | null
            : Upper<S> extends `OPTION<${string}>${string}`
              ? _MapType<_Inner<S>> | null
              : // Record types: record<table> - typed record link
                Upper<S> extends `RECORD<${infer Table}>`
                ? RecordId<_ExtractTableName<Table>>
                : Upper<S> extends `RECORD<${infer Table}>${string}`
                  ? RecordId<_ExtractTableName<Table>>
                  : // Geometry types
                    Upper<S> extends `GEOMETRY<${string}>`
                    ? GeoJSON
                    : Upper<S> extends `GEOMETRY<${string}>${string}`
                      ? GeoJSON
                      : // Plain 'record' without parameter
                        Upper<S> extends 'RECORD'
                        ? RecordId
                        : // Basic types from TypeMap
                          _Map<Lowercase<FirstWord<S>>>;

type _ExtractTableName<S extends string> = Trim<S> extends `${infer T}|${string}`
  ? Lowercase<Trim<T>>
  : Lowercase<Trim<S>>;

type _Inner<S extends string> = S extends `${string}<${infer Rest}`
  ? _ExtractBalanced<Rest, '', 1>
  : never;

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

type _StripExtraParams<S extends string> = _StripAtLevel<S, '', 0>;

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

type _Inc<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10][N];
type _Dec<N extends number> = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9][N];

type _Map<T extends string> = T extends keyof TypeMap ? TypeMap[T] : unknown;

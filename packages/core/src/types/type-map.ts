export namespace TypeKind {
  /** GeoJSON Point geometry kind */
  export type PointGeometry = 'PointGeometry';
  /** GeoJSON LineString geometry kind */
  export type LineStringGeometry = 'LineStringGeometry';
  /** GeoJSON Polygon geometry kind */
  export type PolygonGeometry = 'PolygonGeometry';
  /** GeoJSON MultiPoint geometry kind */
  export type MultiPointGeometry = 'MultiPointGeometry';
  /** GeoJSON MultiLineString geometry kind */
  export type MultiLineStringGeometry = 'MultiLineStringGeometry';
  /** GeoJSON MultiPolygon geometry kind */
  export type MultiPolygonGeometry = 'MultiPolygonGeometry';
  /** GeoJSON GeometryCollection kind */
  export type GeometryCollection = 'GeometryCollection';
  /** Any value kind (no type restriction) */
  export type Any = 'Any';
  /** Boolean kind */
  export type Bool = 'Bool';
  /** Binary data kind */
  export type Bytes = 'Bytes';
  /** RFC 3339 datetime kind */
  export type Datetime = 'Datetime';
  /** 128-bit decimal kind */
  export type Decimal = 'Decimal';
  /** Time duration kind */
  export type Duration = 'Duration';
  /** 64-bit float kind */
  export type Float = 'Float';
  /** 64-bit integer kind */
  export type Int = 'Int';
  /** Auto-detected number kind */
  export type Number = 'Number';
  /** Null value kind */
  export type Null = 'Null';
  /** Generic object kind */
  export type Object = 'Object';
  /** Text string kind */
  export type String = 'String';
  /** UUID v4/v7 kind */
  export type Uuid = 'Uuid';
  /** Regular expression kind */
  export type Regex = 'Regex';
  /** Ordered array kind */
  export type Array = 'Array';
  /** Unique set kind */
  export type Set = 'Set';
  /** Nullable wrapper kind */
  export type Option = 'Option';
  /** String literal kind */
  export type StringLiteral = 'StringLiteral';
  /** Number literal kind */
  export type NumberLiteral = 'NumberLiteral';
  /** Object literal kind */
  export type ObjectLiteral = 'ObjectLiteral';
  /** Tuple literal kind */
  export type TupleLiteral = 'TupleLiteral';
  /** Record reference kind */
  export type RecordId = 'RecordId';
}

/**
 * Union of all valid type kinds.
 * Used as constraint for DataType's kind parameter.
 */
export type AnyTypeKind =
  | TypeKind.PointGeometry
  | TypeKind.LineStringGeometry
  | TypeKind.PolygonGeometry
  | TypeKind.MultiPointGeometry
  | TypeKind.MultiLineStringGeometry
  | TypeKind.MultiPolygonGeometry
  | TypeKind.GeometryCollection
  | TypeKind.Any
  | TypeKind.Bool
  | TypeKind.Bytes
  | TypeKind.Datetime
  | TypeKind.Decimal
  | TypeKind.Duration
  | TypeKind.Float
  | TypeKind.Int
  | TypeKind.Number
  | TypeKind.Null
  | TypeKind.Object
  | TypeKind.String
  | TypeKind.Uuid
  | TypeKind.Regex
  | TypeKind.Array
  | TypeKind.Set
  | TypeKind.Option
  | TypeKind.StringLiteral
  | TypeKind.NumberLiteral
  | TypeKind.ObjectLiteral
  | TypeKind.TupleLiteral
  | TypeKind.RecordId;

/**
 * Base wrapper type for all SurrealDB data types.
 * Provides type-safe discrimination via `__kind` field.
 *
 * @typeParam T - The underlying TypeScript type
 * @typeParam K - The type kind discriminator
 *
 * @example
 * ```ts
 * // StringType is DataType<string, 'String'>
 * type StringType = DataType<string, TypeKind.String>;
 *
 * // Extract value type
 * type Value = StringType['__value']; // string
 *
 * // Extract kind
 * type Kind = StringType['__kind']; // 'String'
 * ```
 */
export interface DataType<T, K extends AnyTypeKind> {
  /** Type discriminator */
  readonly __kind: K;
  /** Underlying value */
  readonly __value: T;
}

/**
 * Valid geometry subtypes for `geometry<X>`.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type GeometrySubtype =
  | 'point'
  | 'linestring'
  | 'polygon'
  | 'multipoint'
  | 'multilinestring'
  | 'multipolygon'
  | 'collection';

/**
 * GeoJSON Point geometry - single coordinate pair.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type PointGeometryType = DataType<
  { readonly type: 'Point'; readonly coordinates: [number, number] },
  TypeKind.PointGeometry
>;

/**
 * GeoJSON LineString geometry - array of coordinate pairs.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type LineStringGeometryType = DataType<
  { readonly type: 'LineString'; readonly coordinates: [number, number][] },
  TypeKind.LineStringGeometry
>;

/**
 * GeoJSON Polygon geometry - array of linear rings.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type PolygonGeometryType = DataType<
  { readonly type: 'Polygon'; readonly coordinates: [number, number][][] },
  TypeKind.PolygonGeometry
>;

/**
 * GeoJSON MultiPoint geometry - multiple points.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type MultiPointGeometryType = DataType<
  { readonly type: 'MultiPoint'; readonly coordinates: [number, number][] },
  TypeKind.MultiPointGeometry
>;

/**
 * GeoJSON MultiLineString geometry - multiple line strings.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type MultiLineStringGeometryType = DataType<
  { readonly type: 'MultiLineString'; readonly coordinates: [number, number][][] },
  TypeKind.MultiLineStringGeometry
>;

/**
 * GeoJSON MultiPolygon geometry - multiple polygons.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type MultiPolygonGeometryType = DataType<
  { readonly type: 'MultiPolygon'; readonly coordinates: [number, number][][][] },
  TypeKind.MultiPolygonGeometry
>;

/**
 * GeoJSON GeometryCollection - collection of different geometry types.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type GeometryCollectionType = DataType<
  { readonly type: 'GeometryCollection'; readonly geometries: AnyGeometryType[] },
  TypeKind.GeometryCollection
>;

/**
 * Union of all GeoJSON geometry types.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
export type AnyGeometryType =
  | PointGeometryType
  | LineStringGeometryType
  | PolygonGeometryType
  | MultiPointGeometryType
  | MultiLineStringGeometryType
  | MultiPolygonGeometryType
  | GeometryCollectionType;

/**
 * SurrealDB `any` type - accepts any value.
 * @see https://surrealdb.com/docs/surrealql/datamodel
 */
export type AnyType = DataType<unknown, TypeKind.Any>;

/**
 * SurrealDB `bool` type - boolean value.
 * @see https://surrealdb.com/docs/surrealql/datamodel
 */
export type BoolType = DataType<boolean, TypeKind.Bool>;

/**
 * SurrealDB `bytes` type - binary data.
 * @see https://surrealdb.com/docs/surrealql/datamodel/bytes
 */
export type BytesType = DataType<Uint8Array, TypeKind.Bytes>;

/**
 * SurrealDB `datetime` type - RFC 3339 datetime with timezone.
 * @see https://surrealdb.com/docs/surrealql/datamodel/datetimes
 */
export type DatetimeType = DataType<Date, TypeKind.Datetime>;

/**
 * SurrealDB `decimal` type - 128-bit decimal for precise calculations.
 * @see https://surrealdb.com/docs/surrealql/datamodel/numbers
 */
export type DecimalType = DataType<number, TypeKind.Decimal>;

/**
 * SurrealDB `duration` type - time duration.
 * @see https://surrealdb.com/docs/surrealql/datamodel/datetimes
 * @example "1h30m", "2w", "500ms"
 */
export type DurationType = DataType<string, TypeKind.Duration>;

/**
 * SurrealDB `float` type - 64-bit floating point number.
 * @see https://surrealdb.com/docs/surrealql/datamodel/numbers
 */
export type FloatType = DataType<number, TypeKind.Float>;

/**
 * SurrealDB `int` type - 64-bit signed integer.
 * @see https://surrealdb.com/docs/surrealql/datamodel/numbers
 */
export type IntType = DataType<number, TypeKind.Int>;

/**
 * SurrealDB `number` type - auto-detected number type.
 * @see https://surrealdb.com/docs/surrealql/datamodel/numbers
 */
export type NumberType = DataType<number, TypeKind.Number>;

/**
 * SurrealDB `null` type - explicit null value.
 * @see https://surrealdb.com/docs/surrealql/datamodel/none-and-null
 */
export type NullType = DataType<null, TypeKind.Null>;

/**
 * SurrealDB `object` type - generic object with string keys.
 * @see https://surrealdb.com/docs/surrealql/datamodel/objects
 */
export type ObjectType = DataType<Record<string, unknown>, TypeKind.Object>;

/**
 * SurrealDB `string` type - UTF-8 text.
 * @see https://surrealdb.com/docs/surrealql/datamodel/strings
 */
export type StringType = DataType<string, TypeKind.String>;

/**
 * SurrealDB `uuid` type - UUID v4 or v7.
 * @see https://surrealdb.com/docs/surrealql/datamodel/uuids
 */
export type UuidType = DataType<string, TypeKind.Uuid>;

/**
 * SurrealDB `regex` type - compiled regular expression.
 * @see https://surrealdb.com/docs/surrealql/datamodel/regex
 */
export type RegexType = DataType<RegExp, TypeKind.Regex>;

/**
 * SurrealDB `array<T>` type - ordered collection.
 * @typeParam T - Element type
 * @see https://surrealdb.com/docs/surrealql/datamodel/arrays
 */
export type ArrayType<T = unknown> = DataType<T[], TypeKind.Array>;

/**
 * SurrealDB `set<T>` type - unique collection (returned as array).
 * @typeParam T - Element type
 * @see https://surrealdb.com/docs/surrealql/datamodel/sets
 */
export type SetType<T = unknown> = DataType<T[], TypeKind.Set>;

/**
 * SurrealDB `option<T>` type - nullable wrapper.
 * @typeParam T - Inner type
 */
export type OptionType<T = unknown> = DataType<T | null, TypeKind.Option>;

/**
 * String literal type - exact string value.
 * @typeParam T - The literal string
 * @see https://surrealdb.com/docs/surrealql/datamodel/literals
 * @example `"draft"`, `"published"`
 */
export type StringLiteralType<T extends string = string> = DataType<T, TypeKind.StringLiteral>;

/**
 * Number literal type - exact number value.
 * @typeParam T - The literal number
 * @see https://surrealdb.com/docs/surrealql/datamodel/literals
 * @example `123`, `-5`, `0`
 */
export type NumberLiteralType<T extends number = number> = DataType<T, TypeKind.NumberLiteral>;

/**
 * Object literal type - object with specific structure.
 * @typeParam T - The object shape
 * @see https://surrealdb.com/docs/surrealql/datamodel/literals
 * @example `{ name: string, age: int }`
 */
export type ObjectLiteralType<T extends Record<string, unknown> = Record<string, unknown>> =
  DataType<T, TypeKind.ObjectLiteral>;

/**
 * Tuple literal type - fixed-length array with specific types.
 * @typeParam T - The tuple type
 * @see https://surrealdb.com/docs/surrealql/datamodel/literals
 * @example `[string, int, bool]`
 */
export type TupleLiteralType<T extends readonly unknown[] = readonly unknown[]> = DataType<
  T,
  TypeKind.TupleLiteral
>;

/**
 * Union of all literal types.
 * @typeParam T - The literal value type
 */
export type LiteralType<T = unknown> =
  | StringLiteralType<T extends string ? T : string>
  | NumberLiteralType<T extends number ? T : number>
  | ObjectLiteralType<T extends Record<string, unknown> ? T : Record<string, unknown>>
  | TupleLiteralType<T extends readonly unknown[] ? T : readonly unknown[]>;

/**
 * SurrealDB record ID - reference to a table row.
 *
 * @typeParam T - Table name(s) this record can reference
 * @see https://surrealdb.com/docs/surrealql/datamodel/ids
 *
 * @example
 * ```ts
 * type UserId = RecordIdType<'user'>;
 * type MultiRef = RecordIdType<'user' | 'admin'>;
 * ```
 */
export type RecordIdType<T extends string = string> = DataType<
  {
    /** Table name */
    readonly table: T;
    /** Record identifier (string, number, array, or object) */
    readonly id: string | number | readonly unknown[] | Record<string, unknown>;
  },
  TypeKind.RecordId
>;

/**
 * Maps SurrealDB scalar type names to their TypeScript representations.
 * Used for type lookup during inference.
 */
export interface ScalarTypeMap {
  any: AnyType;
  bool: BoolType;
  bytes: BytesType;
  datetime: DatetimeType;
  decimal: DecimalType;
  duration: DurationType;
  float: FloatType;
  int: IntType;
  number: NumberType;
  null: NullType;
  object: ObjectType;
  string: StringType;
  uuid: UuidType;
  regex: RegexType;
}

/**
 * Maps SurrealDB geometry subtype names to their TypeScript representations.
 * Used for `geometry<subtype>` inference.
 */
export interface GeometryTypeMap {
  feature: AnyGeometryType;
  point: PointGeometryType;
  line: LineStringGeometryType;
  polygon: PolygonGeometryType;
  multipoint: MultiPointGeometryType;
  multiline: MultiLineStringGeometryType;
  multipolygon: MultiPolygonGeometryType;
  collection: GeometryCollectionType;
}

/**
 * Complete type map for SurrealDB type inference.
 * Extends ScalarTypeMap with parameterless variants of complex types.
 */
export interface TypeMap extends ScalarTypeMap {
  geometry: AnyGeometryType;
  record: RecordIdType;
  array: ArrayType;
  set: SetType;
}

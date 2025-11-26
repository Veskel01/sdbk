/**
 * Valid geometry subtypes in SurrealDB.
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
 * Primitive/scalar types in SurrealDB.
 */
export type PrimitiveType =
  | 'any'
  | 'bool'
  | 'bytes'
  | 'datetime'
  | 'decimal'
  | 'duration'
  | 'float'
  | 'int'
  | 'number'
  | 'object'
  | 'string'
  | 'uuid'
  | 'ulid';

/**
 * Types that can be used as collection item types.
 */
export type CollectionItemType =
  | 'string'
  | 'int'
  | 'float'
  | 'decimal'
  | 'bool'
  | 'number'
  | 'datetime'
  | 'duration'
  | 'uuid'
  | 'bytes'
  | 'object'
  | 'record';

/**
 * Array type definitions.
 * @example
 * - `array`
 * - `array<string>`
 * - `array<string, 10>`
 * - `array<record<user>>`
 */
export type ArrayType =
  | 'array'
  | `array<${CollectionItemType}>`
  | `array<${CollectionItemType}, ${number}>`
  | `array<record<${string}>>`
  | `array<record<${string}>, ${number}>`
  | `array<geometry<${GeometrySubtype}>>`
  | `array<geometry<${GeometrySubtype}>, ${number}>`
  | `array<${string}>`;

/**
 * Set type definitions.
 * @example
 * - `set`
 * - `set<string>`
 * - `set<string, 10>`
 * - `set<record<user>>`
 */
export type SetType =
  | 'set'
  | `set<${CollectionItemType}>`
  | `set<${CollectionItemType}, ${number}>`
  | `set<record<${string}>>`
  | `set<record<${string}>, ${number}>`
  | `set<${string}>`;

/**
 * Geometry type definitions (SurrealQL syntax).
 * @example
 * - `geometry`
 * - `geometry<point>`
 * - `geometry<polygon>`
 */
export type GeometryDataType = 'geometry' | `geometry<${GeometrySubtype}>`;

/**
 * Record type definitions (references to other tables).
 * @example
 * - `record`
 * - `record<user>`
 * - `record<user | post>`
 */
export type RecordType = 'record' | `record<${string}>`;

/**
 * Range type definition.
 */
export type RangeType = 'range';

/**
 * Literal/enum type definitions.
 * @example
 * - `literal`
 * - `literal<"active">`
 * - `literal<1>`
 */
export type LiteralType = 'literal' | `literal<${string}>`;

/**
 * Inline object type definitions.
 * @example
 * - `{ name: string, age: int }`
 */
export type ObjectType = `{${string}}`;

/**
 * Tuple type definitions.
 * @example
 * - `[string, int]`
 * - `[string, int, bool]`
 */
export type TupleType = `[${string}]`;

/**
 * Union type definitions.
 * @example
 * - `string | int`
 * - `"active" | "inactive"`
 */
export type UnionType = `${string}|${string}`;

/**
 * Types that can be wrapped in `option<T>`.
 */
export type NullableType =
  | PrimitiveType
  | ArrayType
  | SetType
  | GeometryDataType
  | RecordType
  | RangeType
  | LiteralType
  | ObjectType
  | TupleType;

/**
 * Option type definitions (nullable wrapper).
 * @example
 * - `option<string>`
 * - `option<record<user>>`
 */
export type OptionType = `option<${NullableType}>`;

/**
 * All valid SurrealDB type definition strings.
 * This is the main type that represents any valid type in a DEFINE FIELD statement.
 *
 * @example
 * ```typescript
 * const types: DataType[] = [
 *   'string',
 *   'array<int>',
 *   'option<record<user>>',
 *   '{ name: string, age: int }',
 *   '[string, int]',
 *   'string | int'
 * ];
 * ```
 */
export type DataType =
  | PrimitiveType
  | ArrayType
  | SetType
  | GeometryDataType
  | RecordType
  | RangeType
  | LiteralType
  | OptionType
  | ObjectType
  | TupleType
  | UnionType;

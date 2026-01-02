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
 * Valid duration subtypes for `duration<X>`.
 */
export type DurationSubtype =
  | 'nanoseconds'
  | 'microseconds'
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks';

/**
 * Scalar (primitive) type definitions in SurrealQL.
 * These are standalone types without parameters.
 */
export type ScalarDef =
  | 'any'
  | 'bool'
  | 'bytes'
  | 'datetime'
  | 'decimal'
  | 'duration'
  | 'float'
  | 'int'
  | 'number'
  | 'null'
  | 'object'
  | 'string'
  | 'uuid'
  | 'ulid';

/**
 * Array type definitions.
 * @example
 * - `array` - untyped array
 * - `array<string>` - typed array
 * - `array<string, 10>` - typed array with max length
 * - `array<record<user>>` - array of record references
 */
export type ArrayDef = 'array' | `array<${string}>` | `array<${string}, ${number}>`;

/**
 * Set type definitions.
 * @example
 * - `set` - untyped set
 * - `set<string>` - typed set
 * - `set<string, 10>` - typed set with max size
 */
export type SetDef = 'set' | `set<${string}>` | `set<${string}, ${number}>`;

/**
 * Option type definition (nullable wrapper).
 * @example
 * - `option<string>` - nullable string
 * - `option<record<user>>` - nullable record reference
 */
export type OptionDef = `option<${string}>`;

/**
 * Record type definitions (references to table rows).
 * @example
 * - `record` - any record reference
 * - `record<user>` - reference to user table
 * - `record<user | post>` - reference to user OR post table
 */
export type RecordDef = 'record' | `record<${string}>`;

/**
 * Range type definitions.
 * @example
 * - `range` - untyped range
 * - `range<int>` - integer range
 */
export type RangeDef = 'range' | `range<${string}>`;

/**
 * Geometry type definitions.
 * @example
 * - `geometry` - any geometry type
 * - `geometry<point>` - point geometry only
 * - `geometry<polygon>` - polygon geometry only
 */
export type GeometryDef = 'geometry' | `geometry<${GeometrySubtype}>`;

/**
 * Literal type definitions (enum-like values).
 * @example
 * - `literal<"active">` - string literal
 * - `literal<1>` - number literal
 */
export type LiteralDef = 'literal' | `literal<${string}>`;

/**
 * Inline object type definitions.
 * @example
 * - `{ name: string, age: int }`
 * - `{ address: { city: string, zip: string } }`
 */
export type ObjectDef = `{${string}}`;

/**
 * Tuple type definitions (fixed-length heterogeneous arrays).
 * @example
 * - `[string, int]`
 * - `[string, int, bool]`
 */
export type TupleDef = `[${string}]`;

/**
 * Union type definitions.
 * @example
 * - `string | int`
 * - `"active" | "inactive" | "pending"`
 */
export type UnionDef = `${string}|${string}`;

/**
 * All valid SurrealDB type definition strings.
 * This is the main type that represents any valid type in a DEFINE FIELD TYPE clause.
 *
 * @example
 * ```typescript
 * const types: TypeDef[] = [
 *   'string',
 *   'array<int>',
 *   'option<record<user>>',
 *   '{ name: string, age: int }',
 *   '[string, int]',
 *   'string | int'
 * ];
 * ```
 */
export type TypeDef =
  | ScalarDef
  | ArrayDef
  | SetDef
  | OptionDef
  | RecordDef
  | RangeDef
  | GeometryDef
  | LiteralDef
  | ObjectDef
  | TupleDef
  | UnionDef;

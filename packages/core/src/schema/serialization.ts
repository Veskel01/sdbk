import type {
  Bytes,
  Datetime,
  Duration,
  Geometry,
  GeometryCollection,
  LineStringGeometry,
  MultiLineStringGeometry,
  MultiPointGeometry,
  MultiPolygonGeometry,
  PointGeometry,
  PolygonGeometry,
  Range,
  RecordId,
  ULID,
  UUID
} from '@sdbk/parser';
import { IDENTIFIER_REGEX } from '../constants';
import type { SurqlSerializable } from '../datatypes/interfaces';
import { isSQLConvertible } from '../query';
import type { ValueInput } from '../util/types';

// TODO - split to multiple files

/** Escapes a string for use in SurrealQL. */
function escapeString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/** Checks if a string is a valid SurrealQL identifier. */
function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_REGEX.test(value);
}

/** Serializes a number to SurrealQL. */
function serializeNumber(value: number): string {
  if (Number.isNaN(value)) {
    return 'NONE';
  }
  if (!Number.isFinite(value)) {
    return value > 0 ? 'math::inf' : '-math::inf';
  }
  return String(value);
}

/** Serializes an array to SurrealQL. */
function serializeArray(value: unknown[]): string {
  const items = value.map(serialize).join(', ');
  return `[${items}]`;
}

/** Serializes a Map to SurrealQL object. */
function serializeMap(value: Map<unknown, unknown>): string {
  const entries = Array.from(value.entries())
    .map(([k, v]) => {
      const key =
        typeof k === 'string' && isValidIdentifier(k) ? k : `'${escapeString(String(k))}'`;
      return `${key}: ${serialize(v)}`;
    })
    .join(', ');
  return `{ ${entries} }`;
}

/** Serializes a plain object to SurrealQL. */
function serializeObject(value: object): string {
  const entries = Object.entries(value)
    .map(([k, v]) => {
      const key = isValidIdentifier(k) ? k : `'${escapeString(k)}'`;
      return `${key}: ${serialize(v)}`;
    })
    .join(', ');
  return `{ ${entries} }`;
}

/** Checks if value has toSurql method. */
function hasSurqlMethod(value: unknown): value is SurqlSerializable {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toSurql' in value &&
    typeof (value as SurqlSerializable).toSurql === 'function'
  );
}

/** Serializes primitive values. */
function serializePrimitive(value: unknown): string | null {
  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }
  if (typeof value === 'number') {
    return serializeNumber(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'bigint') {
    return `${value}`;
  }
  return null;
}

/** Serializes built-in object types. */
function serializeBuiltIn(value: unknown): string | null {
  if (value instanceof Date) {
    return `d'${value.toISOString()}'`;
  }
  if (value instanceof RegExp) {
    return `/${value.source}/${value.flags}`;
  }
  if (Array.isArray(value)) {
    return serializeArray(value);
  }
  if (value instanceof Map) {
    return serializeMap(value);
  }
  if (value instanceof Set) {
    return serializeArray(Array.from(value));
  }
  return null;
}

// =============================================================================
// Main Serialization Function
// =============================================================================

/**
 * Serializes a JavaScript value to its SurrealQL string representation.
 *
 * Supports:
 * - Primitives: string, number, boolean, bigint, null, undefined
 * - Date objects → datetime
 * - Value classes: Duration, Uuid, RecordId, Bytes, RawExpression, Datetime, Geometry
 * - Arrays and Objects
 * - SurrealQL expressions (via isSQLConvertible)
 * - Any object with toSurql() method
 *
 * @param value - The value to serialize
 * @returns The SurrealQL string representation
 *
 * @example
 * serialize('hello')                    // "'hello'"
 * serialize(42)                         // "42"
 * serialize(null)                       // "NONE"
 * serialize(new Date())                 // "d'2024-01-01T00:00:00.000Z'"
 * serialize(duration('1h30m'))          // "1h30m"
 * serialize(recordId('user', 'john'))   // "user:john"
 * serialize([1, 2, 3])                  // "[1, 2, 3]"
 * serialize({ name: 'John' })           // "{ name: 'John' }"
 */
export function serialize(value: unknown): string {
  // Null/undefined → NONE
  if (value === null || value === undefined) {
    return 'NONE';
  }

  // Objects with toSurql() method (SurqlSerializable)
  if (hasSurqlMethod(value)) {
    return value.toSurql();
  }

  // SurrealQL expressions from expression module
  if (isSQLConvertible(value)) {
    return value.toSurrealQL().toQuery().query;
  }

  // Primitives
  const primitiveResult = serializePrimitive(value);
  if (primitiveResult !== null) {
    return primitiveResult;
  }

  // Built-in objects
  const builtInResult = serializeBuiltIn(value);
  if (builtInResult !== null) {
    return builtInResult;
  }

  // Plain object
  if (typeof value === 'object') {
    return serializeObject(value);
  }

  // Fallback
  return String(value);
}

/**
 * Serializes a ValueInput (literal value or SurrealQL expression) to a string.
 */
export function serializeInput<T>(input: ValueInput<T>): string {
  return serialize(input);
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a value implements the SurqlSerializable interface.
 */
export function isSurqlSerializable(value: unknown): value is SurqlSerializable {
  return hasSurqlMethod(value);
}

/**
 * Check if a value is a record ID.
 */
export function isRecordId(value: unknown): value is RecordId {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as RecordId).__brand === 'RecordId'
  );
}

/**
 * Check if a value is a geometry.
 */
export function isGeometry(value: unknown): value is Geometry {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as Geometry).type === 'string'
  );
}

/**
 * Check if a value is a point geometry.
 */
export function isPointGeometry(value: unknown): value is PointGeometry {
  return isGeometry(value) && value.type === 'Point';
}

/**
 * Check if a value is a line string geometry.
 */
export function isLineStringGeometry(value: unknown): value is LineStringGeometry {
  return isGeometry(value) && value.type === 'LineString';
}

/**
 * Check if a value is a polygon geometry.
 */
export function isPolygonGeometry(value: unknown): value is PolygonGeometry {
  return isGeometry(value) && value.type === 'Polygon';
}

/**
 * Check if a value is a multi-point geometry.
 */
export function isMultiPointGeometry(value: unknown): value is MultiPointGeometry {
  return isGeometry(value) && value.type === 'MultiPoint';
}

/**
 * Check if a value is a multi-line string geometry.
 */
export function isMultiLineStringGeometry(value: unknown): value is MultiLineStringGeometry {
  return isGeometry(value) && value.type === 'MultiLineString';
}

/**
 * Check if a value is a multi-polygon geometry.
 */
export function isMultiPolygonGeometry(value: unknown): value is MultiPolygonGeometry {
  return isGeometry(value) && value.type === 'MultiPolygon';
}

/**
 * Check if a value is a geometry collection.
 */
export function isGeometryCollection(value: unknown): value is GeometryCollection {
  return isGeometry(value) && value.type === 'GeometryCollection';
}

/**
 * Check if a value is a duration.
 */
export function isDuration(value: unknown): value is Duration {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as Duration).__brand === 'Duration'
  );
}

/**
 * Check if a value is a UUID.
 */
export function isUuid(value: unknown): value is UUID {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as UUID).__brand === 'Uuid'
  );
}

/**
 * Check if a value is a ULID.
 */
export function isUlid(value: unknown): value is ULID {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as ULID).__brand === 'Ulid'
  );
}

/**
 * Check if a value is a bytes value.
 */
export function isBytes(value: unknown): value is Bytes {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as Bytes).__brand === 'Bytes'
  );
}

/**
 * Check if a value is a datetime.
 */
export function isDatetime(value: unknown): value is Datetime {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as Datetime).__brand === 'Datetime'
  );
}

/**
 * Check if a value is a range.
 */
export function isRange(value: unknown): value is Range {
  return (
    isSurqlSerializable(value) &&
    '__brand' in value &&
    (value as unknown as Range).__brand === 'Range'
  );
}

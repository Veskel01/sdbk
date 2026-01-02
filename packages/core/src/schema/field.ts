import type { NONE_TOKEN, NULL_TOKEN } from '../constants';
import { ENTITY_KIND } from '../meta';
import type { StringHint } from '../types';

/**
 * Scalar (primitive) data types in SurrealDB.
 * These types don't have generic parameters.
 */
export type ScalarDataType =
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
  | 'regex';

/**
 * Special types used internally by SurrealDB.
 */
export type SpecialDataType = 'null' | 'none';

/**
 * Literal data types in SurrealDB.
 */
export type LiteralDataType = StringHint;

/**
 * Available geometry kinds in SurrealDB.
 * Maps to GeoJSON geometry types.
 */
export type GeometryKind =
  | 'feature'
  | 'point'
  | 'line'
  | 'polygon'
  | 'multipoint'
  | 'multiline'
  | 'multipolygon'
  | 'collection';

/**
 * Full SurrealDB type string representation.
 */
export type FieldDataType =
  // Scalar types (no parameters)
  | ScalarDataType
  | LiteralDataType
  | SpecialDataType
  // Parameterized types
  | `array<${string}>`
  | `set<${string}>`
  | `option<${string}>`
  | `record<${string}>`
  | `geometry<${GeometryKind}>`;

/**
 * The name of a field.
 */
export type FieldName = string;

/**
 * The kind of absence for a field.
 * - `null` - The field can be `null`
 * - `none` - The field can be `undefined`
 * - `undefined` - The field can be `undefined`
 */
export type FieldAbsence = typeof NULL_TOKEN | typeof NONE_TOKEN | undefined;

/**
 * Permission level for field operations.
 * - `'NONE'` - No access allowed
 * - `'FULL'` - Full access allowed
 * - Custom WHERE clause string for conditional access
 */
export type FieldPermission = 'NONE' | 'FULL' | StringHint;

/**
 * Granular permissions for field operations.
 * Each operation can have its own permission level.
 */
export type FieldPermissions =
  | {
      /** Permission for SELECT operations */
      readonly select?: FieldPermission;
      /** Permission for CREATE operations */
      readonly create?: FieldPermission;
      /** Permission for UPDATE operations */
      readonly update?: FieldPermission;
    }
  | FieldPermission;

/**
 * Define mode for field definition.
 * - `'OVERWRITE'` - Overwrites existing field definition
 * - `'IF NOT EXISTS'` - Creates field only if it doesn't exist
 */
export type FieldDefineMode = 'OVERWRITE' | 'IF NOT EXISTS';

export interface FieldBaseConfig<TName extends FieldName, TDataType extends FieldDataType> {
  readonly name: TName;
  readonly dataType: TDataType;
  readonly tableName: string;
  readonly defineMode?: FieldDefineMode;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

export abstract class Field<T extends FieldBaseConfig<FieldName, FieldDataType>> {
  public static readonly [ENTITY_KIND]: string = 'Field';

  public declare readonly _: T;

  public readonly name: T['name'];
  public readonly dataType: T['dataType'];
  public readonly tableName: T['tableName'];
  public readonly defineMode: T['defineMode'];
  public readonly permissions: T['permissions'];
  public readonly comment: T['comment'];

  protected constructor(config: T) {
    this.name = config.name;
    this.dataType = config.dataType;
    this.tableName = config.tableName;
    this.defineMode = config.defineMode;
    this.permissions = config.permissions;
    this.comment = config.comment;
  }

  public abstract getDbType(): string;
}

// TODO

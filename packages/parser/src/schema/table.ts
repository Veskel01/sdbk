/**
 * Field permissions schema.
 */
export interface FieldPermissionsSchema {
  full: boolean;
  none: boolean;
  select: string | undefined;
  create: string | undefined;
  update: string | undefined;
  delete: string | undefined;
}

/**
 * Reference configuration schema.
 */
export interface ReferenceConfigSchema {
  onDelete: string | undefined;
}

/**
 * Field definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/field
 */
export interface FieldSchema {
  name: string;
  type: unknown;
  dataType: string | undefined;
  optional: boolean;
  readonly: boolean;
  flexible: boolean;
  computed: string | undefined;
  default: string | undefined;
  defaultAlways: boolean;
  value: string | undefined;
  assert: string | undefined;
  reference: ReferenceConfigSchema | undefined;
  permissions: FieldPermissionsSchema | undefined;
  comment: string | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

/**
 * Table permissions schema.
 */
export interface TablePermissionsSchema {
  full: boolean;
  none: boolean;
  select: string | undefined;
  create: string | undefined;
  update: string | undefined;
  delete: string | undefined;
}

/**
 * Relation configuration schema.
 */
export interface RelationConfigSchema {
  from: string | undefined;
  to: string | undefined;
  enforced: boolean;
}

/**
 * Changefeed configuration schema.
 */
export interface ChangefeedConfigSchema {
  duration: string | undefined;
  includeOriginal: boolean;
}

/**
 * Table definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/table
 */
export interface TableSchema {
  /** The table name */
  name: string;
  /** Schema mode (schemafull or schemaless) */
  schemaMode: 'schemafull' | 'schemaless' | undefined;
  /** Table type (any, normal, or relation) */
  tableType: 'any' | 'normal' | 'relation' | undefined;
  /** Whether DROP modifier was used */
  drop: boolean;
  /** Whether OVERWRITE modifier was used */
  overwrite: boolean;
  /** Whether IF NOT EXISTS modifier was used */
  ifNotExists: boolean;
  /** The AS SELECT query for views */
  asSelect: string | undefined;
  /** Changefeed configuration */
  changefeed: ChangefeedConfigSchema | undefined;
  /** Table permissions */
  permissions: TablePermissionsSchema | undefined;
  /** Optional comment */
  comment: string | undefined;
  /** Relation configuration if TYPE RELATION */
  relationConfig: RelationConfigSchema | undefined;
  /** Fields defined on this table */
  fields: Record<string, FieldSchema>;
}

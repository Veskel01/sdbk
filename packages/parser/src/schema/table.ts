/**
 * Permissions attached to a single field after parsing `DEFINE FIELD`.
 *
 * @remarks
 * Values mirror the `PERMISSIONS` clause as resolved for that field.
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
 * Configuration of a `REFERENCE` clause for a field.
 */
export interface ReferenceConfigSchema {
  onDelete: string | undefined;
}

/**
 * Parsed definition of a single table field.
 *
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
 * Table‑level permissions resolved from a `DEFINE TABLE` statement.
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
 * Shape of a `TYPE RELATION` configuration for relation tables.
 */
export interface RelationConfigSchema {
  from: string | undefined;
  to: string | undefined;
  enforced: boolean;
}

/**
 * Configuration of a `CHANGEFEED` clause attached to a table.
 */
export interface ChangefeedConfigSchema {
  duration: string | undefined;
  includeOriginal: boolean;
}

/**
 * Parsed definition of a SurrealDB table.
 *
 * @remarks
 * Instances of this interface are produced by {@link BuildSchema} from `DEFINE TABLE`
 * and related `DEFINE FIELD` statements.
 *
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

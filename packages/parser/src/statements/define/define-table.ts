import type { ParseErrors } from '../../parser/errors';
import type {
  ExtractComment,
  FirstWord,
  IsValidTableName,
  SkipIfNotExists,
  SkipOverwrite,
  Trim,
  Upper
} from '../../utils';

/**
 * Table permissions schema.
 */
export interface TablePermissions {
  full: boolean;
  none: boolean;
  select: string | undefined;
  create: string | undefined;
  update: string | undefined;
  delete: string | undefined;
}

/**
 * Relation type configuration.
 */
export interface RelationConfig<
  From extends string | undefined = string | undefined,
  To extends string | undefined = string | undefined,
  Enforced extends boolean = boolean
> {
  from: From;
  to: To;
  enforced: Enforced;
}

/**
 * Changefeed configuration.
 */
export interface ChangefeedConfig<
  Duration extends string | undefined = string | undefined,
  IncludeOriginal extends boolean = boolean
> {
  duration: Duration;
  includeOriginal: IncludeOriginal;
}

/**
 * Result type for parsed DEFINE TABLE statements.
 *
 * @template Name - The table name
 * @template SchemaMode - schemafull, schemaless, or undefined
 * @template TableType - any, normal, or relation
 * @template Drop - Whether DROP modifier is present
 * @template Overwrite - Whether OVERWRITE modifier is present
 * @template IfNotExists - Whether IF NOT EXISTS modifier is present
 * @template AsSelect - The AS SELECT query for views
 * @template Changefeed - Changefeed configuration
 * @template Permissions - Table permissions
 * @template Comment - Optional comment
 * @template RelationCfg - Relation configuration if TYPE RELATION
 */
export interface TableResult<
  Name extends string = string,
  SchemaMode extends 'schemafull' | 'schemaless' | undefined = undefined,
  TableType extends 'any' | 'normal' | 'relation' | undefined = undefined,
  Drop extends boolean = false,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false,
  AsSelect extends string | undefined = undefined,
  Changefeed extends ChangefeedConfig | undefined = undefined,
  Permissions extends TablePermissions | undefined = undefined,
  Comment extends string | undefined = undefined,
  RelationCfg extends RelationConfig | undefined = undefined
> {
  kind: 'table';
  name: Name;
  schemaMode: SchemaMode;
  tableType: TableType;
  drop: Drop;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
  asSelect: AsSelect;
  changefeed: Changefeed;
  permissions: Permissions;
  comment: Comment;
  relationConfig: RelationCfg;
}

export type ParseDefineTable<S extends string> = _ParseTable<Trim<S>>;

type _ParseTable<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'TABLE'
      ? _ExtractModifiersAndName<Trim<C>>
      : never
    : never
  : never;

type _ExtractModifiersAndName<S extends string> = Upper<S> extends `OVERWRITE ${string}`
  ? _ParseTableBody<SkipOverwrite<S>, true, false>
  : Upper<S> extends `IF NOT EXISTS ${string}`
    ? _ParseTableBody<SkipIfNotExists<S>, false, true>
    : _ParseTableBody<S, false, false>;

type _ParseTableBody<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = S extends `${infer Name} ${infer Opts}`
  ? IsValidTableName<Name> extends true
    ? TableResult<
        Name,
        _ExtractSchemaMode<Opts>,
        _ExtractTableType<Opts>,
        _HasDrop<Opts>,
        Overwrite,
        IfNotExists,
        _ExtractAsSelect<Opts>,
        _ExtractChangefeed<Opts>,
        _ExtractPermissions<Opts>,
        ExtractComment<Opts>,
        _ExtractRelationConfig<Opts>
      >
    : ParseErrors.InvalidTableName
  : IsValidTableName<S> extends true
    ? TableResult<S, 'schemaless', undefined, false, Overwrite, IfNotExists>
    : ParseErrors.InvalidTableName;

// Schema mode extraction
// Defaults to 'schemaless' if not specified (SurrealDB default behavior)
type _ExtractSchemaMode<S extends string> = Upper<S> extends `${string}SCHEMAFULL${string}`
  ? 'schemafull'
  : Upper<S> extends `${string}SCHEMALESS${string}`
    ? 'schemaless'
    : 'schemaless';

// Table type extraction
type _ExtractTableType<S extends string> = Upper<S> extends `${string}TYPE ANY${string}`
  ? 'any'
  : Upper<S> extends `${string}TYPE NORMAL${string}`
    ? 'normal'
    : Upper<S> extends `${string}TYPE RELATION${string}`
      ? 'relation'
      : undefined;

// DROP detection
type _HasDrop<S extends string> = Upper<S> extends `DROP${string}`
  ? true
  : Upper<S> extends `${string} DROP${string}`
    ? true
    : Upper<S> extends `${string} DROP`
      ? true
      : false;

// AS SELECT extraction
type _ExtractAsSelect<S extends string> = S extends `${string}AS SELECT ${infer Query}`
  ? `SELECT ${_TrimAsSelectQuery<Query>}`
  : S extends `${string}as select ${infer Query}`
    ? `SELECT ${_TrimAsSelectQuery<Query>}`
    : undefined;

type _TrimAsSelectQuery<S extends string> = S extends `${infer Q} CHANGEFEED ${string}`
  ? Trim<Q>
  : S extends `${infer Q} PERMISSIONS ${string}`
    ? Trim<Q>
    : S extends `${infer Q} COMMENT ${string}`
      ? Trim<Q>
      : Trim<S>;

// Changefeed extraction
type _ExtractChangefeed<S extends string> = Upper<S> extends `${string}CHANGEFEED ${string}`
  ? _ParseChangefeedConfig<S>
  : undefined;

type _ParseChangefeedConfig<S extends string> = S extends `${string}CHANGEFEED ${infer Rest}`
  ? _ExtractChangefeedDuration<Trim<Rest>>
  : S extends `${string}changefeed ${infer Rest}`
    ? _ExtractChangefeedDuration<Trim<Rest>>
    : undefined;

type _ExtractChangefeedDuration<S extends string> = S extends `${infer D} INCLUDE ORIGINAL${string}`
  ? { duration: D; includeOriginal: true }
  : S extends `${infer D} include original${string}`
    ? { duration: D; includeOriginal: true }
    : S extends `${infer D} ${string}`
      ? { duration: D; includeOriginal: false }
      : { duration: S; includeOriginal: false };

// Permissions extraction
type _ExtractPermissions<S extends string> = Upper<S> extends `${string}PERMISSIONS NONE${string}`
  ? {
      full: false;
      none: true;
      select: undefined;
      create: undefined;
      update: undefined;
      delete: undefined;
    }
  : Upper<S> extends `${string}PERMISSIONS FULL${string}`
    ? {
        full: true;
        none: false;
        select: undefined;
        create: undefined;
        update: undefined;
        delete: undefined;
      }
    : Upper<S> extends `${string}PERMISSIONS FOR ${string}`
      ? _ParseDetailedPermissions<S>
      : undefined;

type _ParseDetailedPermissions<S extends string> = {
  full: false;
  none: false;
  select: _ExtractPermissionFor<S, 'SELECT'>;
  create: _ExtractPermissionFor<S, 'CREATE'>;
  update: _ExtractPermissionFor<S, 'UPDATE'>;
  delete: _ExtractPermissionFor<S, 'DELETE'>;
};

type _ExtractPermissionFor<
  S extends string,
  Action extends string
> = Upper<S> extends `${string}FOR ${Action} ${string}`
  ? _ExtractPermissionExpression<S, Action>
  : Upper<S> extends `${string}FOR ${Action},${string}`
    ? _ExtractPermissionExpression<S, Action>
    : undefined;

type _ExtractPermissionExpression<
  S extends string,
  Action extends string
> = S extends `${string}FOR ${Lowercase<Action>} ${infer Expr}`
  ? _TrimPermissionExpr<Expr>
  : S extends `${string}FOR ${Action} ${infer Expr}`
    ? _TrimPermissionExpr<Expr>
    : undefined;

type _TrimPermissionExpr<S extends string> = S extends `${infer E} FOR ${string}`
  ? Trim<E>
  : S extends `${infer E} COMMENT ${string}`
    ? Trim<E>
    : Trim<S>;

// Relation config extraction
type _ExtractRelationConfig<S extends string> = Upper<S> extends `${string}TYPE RELATION${string}`
  ? {
      from: _ExtractRelationFrom<S>;
      to: _ExtractRelationTo<S>;
      enforced: _HasEnforced<S>;
    }
  : undefined;

type _ExtractRelationFrom<S extends string> = Upper<S> extends `${string}FROM ${string}`
  ? _GetRelationTable<S, 'FROM'>
  : Upper<S> extends `${string}IN ${string}`
    ? _GetRelationTable<S, 'IN'>
    : undefined;

type _ExtractRelationTo<S extends string> = Upper<S> extends `${string}TO ${string}`
  ? _GetRelationTable<S, 'TO'>
  : Upper<S> extends `${string}OUT ${string}`
    ? _GetRelationTable<S, 'OUT'>
    : undefined;

type _GetRelationTable<
  S extends string,
  Keyword extends string
> = S extends `${string}${Keyword} ${infer Table} ${string}`
  ? FirstWord<Table>
  : S extends `${string}${Lowercase<Keyword>} ${infer Table} ${string}`
    ? FirstWord<Table>
    : S extends `${string}${Keyword} ${infer Table}`
      ? FirstWord<Table>
      : S extends `${string}${Lowercase<Keyword>} ${infer Table}`
        ? FirstWord<Table>
        : undefined;

type _HasEnforced<S extends string> = Upper<S> extends `${string}ENFORCED${string}` ? true : false;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    TABLE: ParseDefineTable<S>;
  }
}

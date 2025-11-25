import type { ParseDataType, ParseErrors } from '../../parser';
import type { HasFlexible, HasReadonly } from '../../parser/modifiers';
import type {
  AfterFirstWord,
  ExtractComment,
  ExtractExprUntilKeyword,
  FirstWord,
  IsValidFieldName,
  Trim,
  Upper
} from '../../utils';

/**
 * Reference ON DELETE action types.
 * @see https://surrealdb.com/docs/surrealql/statements/define/field#defining-a-reference
 */
export type ReferenceOnDelete = 'REJECT' | 'CASCADE' | 'IGNORE' | 'UNSET' | string;

/**
 * Field permissions structure.
 */
export interface FieldPermissions<
  Select extends string | undefined = string | undefined,
  Create extends string | undefined = string | undefined,
  Update extends string | undefined = string | undefined,
  Delete extends string | undefined = string | undefined
> {
  full: boolean;
  none: boolean;
  select: Select;
  create: Create;
  update: Update;
  delete: Delete;
}

/**
 * Reference configuration for record link fields.
 */
export interface ReferenceConfig<OnDelete extends string | undefined = string | undefined> {
  onDelete: OnDelete;
}

/**
 * Result of parsing a DEFINE FIELD statement.
 * Supports both regular fields and computed fields.
 * @see https://surrealdb.com/docs/surrealql/statements/define/field
 */
export interface FieldResult<
  Name extends string = string,
  Table extends string = string,
  Type = unknown,
  DataType extends string | undefined = string | undefined,
  Readonly extends boolean = false,
  Flexible extends boolean = false,
  Computed extends string | undefined = string | undefined,
  Default extends string | undefined = string | undefined,
  DefaultAlways extends boolean = false,
  Value extends string | undefined = string | undefined,
  Assert extends string | undefined = string | undefined,
  Reference extends ReferenceConfig | undefined = ReferenceConfig | undefined,
  Permissions extends FieldPermissions | undefined = FieldPermissions | undefined,
  Comment extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'field';
  name: Name;
  table: Table;
  type: Type;
  dataType: DataType;
  readonly: Readonly;
  flexible: Flexible;
  computed: Computed;
  default: Default;
  defaultAlways: DefaultAlways;
  value: Value;
  assert: Assert;
  reference: Reference;
  permissions: Permissions;
  comment: Comment;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineField<S extends string> = _ParseField<Trim<S>>;

type _ParseField<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'FIELD'
      ? _FieldBody<Trim<C>>
      : never
    : never
  : never;

type _FieldBody<S extends string> = _ExtractNameAndModifiers<S> extends {
  name: infer FName extends string;
  rest: infer Rest extends string;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? IsValidFieldName<FName> extends true
    ? _AfterFieldName<Rest> extends {
        table: infer TName extends string;
        opts: infer Opts extends string;
      }
      ? FieldResult<
          FName,
          TName,
          _ExtractType<Opts>,
          _ExtractDataType<Opts>,
          HasReadonly<Opts>,
          HasFlexible<Opts>,
          _ExtractComputed<Opts>,
          _ExtractDefault<Opts>,
          _HasDefaultAlways<Opts>,
          _ExtractValue<Opts>,
          _ExtractAssert<Opts>,
          _ExtractReference<Opts>,
          _ExtractFieldPermissions<Opts>,
          ExtractComment<Opts>,
          OW,
          INE
        >
      : never
    : ParseErrors.InvalidFieldName
  : never;

type _ExtractNameAndModifiers<S extends string> = Upper<FirstWord<S>> extends 'OVERWRITE'
  ? {
      name: FirstWord<AfterFirstWord<S>>;
      rest: AfterFirstWord<AfterFirstWord<S>>;
      overwrite: true;
      ifNotExists: false;
    }
  : Upper<S> extends `IF NOT EXISTS ${string}`
    ? _ExtractAfterIfNotExists<S>
    : {
        name: FirstWord<S>;
        rest: AfterFirstWord<S>;
        overwrite: false;
        ifNotExists: false;
      };

type _ExtractAfterIfNotExists<S extends string> =
  S extends `${string} ${string} ${string} ${infer Rest}`
    ? {
        name: FirstWord<Trim<Rest>>;
        rest: AfterFirstWord<Trim<Rest>>;
        overwrite: false;
        ifNotExists: true;
      }
    : never;

type _AfterFieldName<S extends string> = Upper<FirstWord<S>> extends 'ON'
  ? Upper<FirstWord<AfterFirstWord<S>>> extends 'TABLE'
    ? {
        table: Trim<FirstWord<AfterFirstWord<AfterFirstWord<S>>>>;
        opts: AfterFirstWord<AfterFirstWord<AfterFirstWord<S>>>;
      }
    : { table: Trim<FirstWord<AfterFirstWord<S>>>; opts: AfterFirstWord<AfterFirstWord<S>> }
  : never;

// Extract COMPUTED clause
type _ExtractComputed<S extends string> = Upper<S> extends `${string}COMPUTED ${string}`
  ? _FindAndExtractComputed<S>
  : undefined;

type _FindAndExtractComputed<S extends string> = S extends `${string}COMPUTED ${infer Rest}`
  ? ExtractExprUntilKeyword<Rest>
  : S extends `${string}computed ${infer Rest}`
    ? ExtractExprUntilKeyword<Rest>
    : S extends `${string}Computed ${infer Rest}`
      ? ExtractExprUntilKeyword<Rest>
      : undefined;

// Extract DEFAULT clause
type _ExtractDefault<S extends string> = Upper<S> extends `${string}DEFAULT ${string}`
  ? _FindAndExtractDefault<S>
  : undefined;

type _FindAndExtractDefault<S extends string> = S extends `${string}DEFAULT ${infer Rest}`
  ? _ExtractDefaultValue<Rest>
  : S extends `${string}default ${infer Rest}`
    ? _ExtractDefaultValue<Rest>
    : S extends `${string}Default ${infer Rest}`
      ? _ExtractDefaultValue<Rest>
      : undefined;

type _ExtractDefaultValue<S extends string> = Upper<S> extends `ALWAYS ${string}`
  ? _ExtractAfterAlways<S>
  : ExtractExprUntilKeyword<S>;

type _ExtractAfterAlways<S extends string> = S extends `ALWAYS ${infer Rest}`
  ? ExtractExprUntilKeyword<Rest>
  : S extends `always ${infer Rest}`
    ? ExtractExprUntilKeyword<Rest>
    : S extends `Always ${infer Rest}`
      ? ExtractExprUntilKeyword<Rest>
      : ExtractExprUntilKeyword<S>;

// Check if DEFAULT ALWAYS is used
type _HasDefaultAlways<S extends string> = Upper<S> extends `${string}DEFAULT ALWAYS ${string}`
  ? true
  : false;

// Extract VALUE clause (case-insensitive match, preserve original case)
type _ExtractValue<S extends string> = Upper<S> extends `${string}VALUE ${string}`
  ? _FindAndExtractValue<S>
  : undefined;

type _FindAndExtractValue<S extends string> = S extends `${string}VALUE ${infer Rest}`
  ? ExtractExprUntilKeyword<Rest>
  : S extends `${string}value ${infer Rest}`
    ? ExtractExprUntilKeyword<Rest>
    : S extends `${string}Value ${infer Rest}`
      ? ExtractExprUntilKeyword<Rest>
      : undefined;

// Extract ASSERT clause (case-insensitive match, preserve original case)
type _ExtractAssert<S extends string> = Upper<S> extends `${string}ASSERT ${string}`
  ? _FindAndExtractAssert<S>
  : undefined;

type _FindAndExtractAssert<S extends string> = S extends `${string}ASSERT ${infer Rest}`
  ? ExtractExprUntilKeyword<Rest>
  : S extends `${string}assert ${infer Rest}`
    ? ExtractExprUntilKeyword<Rest>
    : S extends `${string}Assert ${infer Rest}`
      ? ExtractExprUntilKeyword<Rest>
      : undefined;

// Extract REFERENCE clause
type _ExtractReference<S extends string> = Upper<S> extends `${string}REFERENCE${string}`
  ? { onDelete: _ExtractOnDelete<S> }
  : undefined;

type _ExtractOnDelete<S extends string> = Upper<S> extends `${string}ON DELETE REJECT${string}`
  ? 'REJECT'
  : Upper<S> extends `${string}ON DELETE CASCADE${string}`
    ? 'CASCADE'
    : Upper<S> extends `${string}ON DELETE IGNORE${string}`
      ? 'IGNORE'
      : Upper<S> extends `${string}ON DELETE UNSET${string}`
        ? 'UNSET'
        : Upper<S> extends `${string}ON DELETE THEN ${string}`
          ? _ExtractOnDeleteThen<S>
          : undefined;

type _ExtractOnDeleteThen<S extends string> = S extends `${string}ON DELETE THEN ${infer Rest}`
  ? _TrimOnDeleteExpr<Trim<Rest>>
  : S extends `${string}on delete then ${infer Rest}`
    ? _TrimOnDeleteExpr<Trim<Rest>>
    : undefined;

type _TrimOnDeleteExpr<S extends string> = S extends `${infer Expr} DEFAULT ${string}`
  ? Trim<Expr>
  : S extends `${infer Expr} VALUE ${string}`
    ? Trim<Expr>
    : S extends `${infer Expr} ASSERT ${string}`
      ? Trim<Expr>
      : S extends `${infer Expr} READONLY${string}`
        ? Trim<Expr>
        : S extends `${infer Expr} PERMISSIONS ${string}`
          ? Trim<Expr>
          : S extends `${infer Expr} COMMENT ${string}`
            ? Trim<Expr>
            : Trim<S>;

// Extract PERMISSIONS for FIELD
type _ExtractFieldPermissions<S extends string> =
  Upper<S> extends `${string}PERMISSIONS NONE${string}`
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
      : _HasPermissionsWithFor<S> extends true
        ? {
            full: false;
            none: false;
            select: _ExtractForPermission<S, 'SELECT'>;
            create: _ExtractForPermission<S, 'CREATE'>;
            update: _ExtractForPermission<S, 'UPDATE'>;
            delete: _ExtractForPermission<S, 'DELETE'>;
          }
        : undefined;

type _HasPermissionsWithFor<S extends string> =
  Upper<S> extends `${string}PERMISSIONS${string}FOR${string}` ? true : false;

type _ExtractForPermission<S extends string, Action extends string> = _FindForClause<S, Action>;

type _FindForClause<
  S extends string,
  Action extends string
> = S extends `${string}FOR ${infer Rest}`
  ? _MatchAction<Trim<Rest>, Action>
  : S extends `${string}for ${infer Rest}`
    ? _MatchAction<Trim<Rest>, Action>
    : S extends `${string}For ${infer Rest}`
      ? _MatchAction<Trim<Rest>, Action>
      : undefined;

type _MatchAction<S extends string, Action extends string> = Upper<FirstWord<S>> extends Action
  ? _ExtractPermExpr<AfterFirstWord<S>>
  : _FindForClause<S, Action>;

type _ExtractPermExpr<S extends string> = S extends `${infer Expr} FOR ${string}`
  ? Trim<Expr>
  : S extends `${infer Expr} for ${string}`
    ? Trim<Expr>
    : S extends `${infer Expr} For ${string}`
      ? Trim<Expr>
      : S extends `${infer Expr} COMMENT ${string}`
        ? Trim<Expr>
        : S extends `${infer Expr} comment ${string}`
          ? Trim<Expr>
          : S extends `${infer Expr};${string}`
            ? Trim<Expr>
            : Trim<S>;

type _ExtractType<S extends string> = _HasTypeKeyword<S> extends true
  ? ParseDataType<_TypeVal<S>>
  : unknown;

/** Check if string contains TYPE keyword (handles space, newline, tab after TYPE) */
type _HasTypeKeyword<S extends string> = _NormalizeWS<Upper<S>> extends `TYPE ${string}`
  ? true
  : _NormalizeWS<Upper<S>> extends `${string} TYPE ${string}`
    ? true
    : false;

/** Normalize first whitespace char after TYPE to space for matching */
type _NormalizeWS<S extends string> = S extends `${infer Before}TYPE\r\n${infer After}`
  ? `${Before}TYPE ${After}`
  : S extends `${infer Before}TYPE\n${infer After}`
    ? `${Before}TYPE ${After}`
    : S extends `${infer Before}TYPE\t${infer After}`
      ? `${Before}TYPE ${After}`
      : S;

type _ExtractDataType<S extends string> = _HasTypeKeyword<S> extends true ? _TypeVal<S> : undefined;

type _TypeVal<S extends string> = _ExtractAfterType<S> extends infer R extends string
  ? _CleanType<Trim<R>>
  : never;

/** Extract content after TYPE keyword, handling space/newline/tab separators */
type _ExtractAfterType<S extends string> = _ExtractAfterTypeNorm<_NormalizeTypeWS<S>>;

type _ExtractAfterTypeNorm<S extends string> = S extends `${string}TYPE ${infer R}`
  ? R
  : S extends `${string}type ${infer R}`
    ? R
    : S extends `${string}Type ${infer R}`
      ? R
      : never;

/** Normalize whitespace after TYPE keyword to space */
type _NormalizeTypeWS<S extends string> = S extends `${infer Before}TYPE\r\n${infer After}`
  ? `${Before}TYPE ${After}`
  : S extends `${infer Before}TYPE\n${infer After}`
    ? `${Before}TYPE ${After}`
    : S extends `${infer Before}TYPE\t${infer After}`
      ? `${Before}TYPE ${After}`
      : S extends `${infer Before}type\r\n${infer After}`
        ? `${Before}type ${After}`
        : S extends `${infer Before}type\n${infer After}`
          ? `${Before}type ${After}`
          : S extends `${infer Before}type\t${infer After}`
            ? `${Before}type ${After}`
            : S extends `${infer Before}Type\r\n${infer After}`
              ? `${Before}Type ${After}`
              : S extends `${infer Before}Type\n${infer After}`
                ? `${Before}Type ${After}`
                : S extends `${infer Before}Type\t${infer After}`
                  ? `${Before}Type ${After}`
                  : S;

type _CleanType<S extends string> = Upper<S> extends `${string} READONLY${string}`
  ? _TrimUpper<S, 'READONLY'>
  : Upper<S> extends `${string} FLEXIBLE${string}`
    ? _TrimUpper<S, 'FLEXIBLE'>
    : Upper<S> extends `${string} REFERENCE${string}`
      ? _TrimUpper<S, 'REFERENCE'>
      : Upper<S> extends `${string} DEFAULT${string}`
        ? _TrimUpper<S, 'DEFAULT'>
        : Upper<S> extends `${string} VALUE${string}`
          ? _TrimUpper<S, 'VALUE'>
          : Upper<S> extends `${string} ASSERT${string}`
            ? _TrimUpper<S, 'ASSERT'>
            : Upper<S> extends `${string} PERMISSIONS${string}`
              ? _TrimUpper<S, 'PERMISSIONS'>
              : Upper<S> extends `${string} COMMENT${string}`
                ? _TrimUpper<S, 'COMMENT'>
                : Trim<S>;

type _TrimUpper<S extends string, K extends string> = S extends `${infer Before} ${K}${string}`
  ? Trim<Before>
  : S extends `${infer Before} ${Lowercase<K>}${string}`
    ? Trim<Before>
    : S extends `${infer Before} ${Capitalize<Lowercase<K>>}${string}`
      ? Trim<Before>
      : Trim<S>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    FIELD: ParseDefineField<S>;
  }
}

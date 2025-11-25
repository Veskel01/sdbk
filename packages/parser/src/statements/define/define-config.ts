import type { AfterFirstWord, FirstWord, HasUnclosedParen, Trim, Upper } from '../../utils';

/**
 * Tables configuration for GraphQL.
 */
export type TablesConfig = 'AUTO' | 'NONE' | { include: string[] } | { exclude: string[] };

/**
 * Functions configuration for GraphQL.
 */
export type FunctionsConfig = 'AUTO' | 'NONE' | { include: string[] } | { exclude: string[] };

/**
 * Result of parsing a DEFINE CONFIG API statement.
 */
export interface ApiConfigResult<
  Middleware extends string[] = string[],
  Permissions extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'config';
  configType: 'api';
  middleware: Middleware;
  permissions: Permissions;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

/**
 * Result of parsing a DEFINE CONFIG GRAPHQL statement.
 */
export interface GraphQLConfigResult<
  Tables extends string = string,
  Functions extends string = string,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'config';
  configType: 'graphql';
  tables: Tables;
  functions: Functions;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ConfigResult = ApiConfigResult | GraphQLConfigResult;

export type ParseDefineConfig<S extends string> = _ParseConfig<Trim<S>>;

type _ParseConfig<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'CONFIG'
      ? _ConfigBody<Trim<C>>
      : never
    : never
  : never;

type _ConfigBody<S extends string> = _ExtractModifiersAndType<S> extends {
  configType: infer CT extends 'api' | 'graphql';
  rest: infer Rest extends string;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? CT extends 'api'
    ? ApiConfigResult<_ExtractMiddleware<Rest>, _ExtractPermissions<Rest>, OW, INE>
    : GraphQLConfigResult<_ExtractTables<Rest>, _ExtractFunctions<Rest>, OW, INE>
  : never;

type _ExtractModifiersAndType<S extends string> = Upper<FirstWord<S>> extends 'OVERWRITE'
  ? _GetConfigType<AfterFirstWord<S>> extends {
      configType: infer CT extends 'api' | 'graphql';
      rest: infer Rest extends string;
    }
    ? { configType: CT; rest: Rest; overwrite: true; ifNotExists: false }
    : never
  : Upper<S> extends `IF NOT EXISTS ${string}`
    ? _ExtractAfterIfNotExists<S>
    : _GetConfigType<S> extends {
          configType: infer CT extends 'api' | 'graphql';
          rest: infer Rest extends string;
        }
      ? { configType: CT; rest: Rest; overwrite: false; ifNotExists: false }
      : never;

type _ExtractAfterIfNotExists<S extends string> =
  S extends `${string} ${string} ${string} ${infer Rest}`
    ? _GetConfigType<Trim<Rest>> extends {
        configType: infer CT extends 'api' | 'graphql';
        rest: infer R extends string;
      }
      ? { configType: CT; rest: R; overwrite: false; ifNotExists: true }
      : never
    : never;

type _GetConfigType<S extends string> = Upper<FirstWord<S>> extends 'API'
  ? { configType: 'api'; rest: AfterFirstWord<S> }
  : Upper<FirstWord<S>> extends 'GRAPHQL'
    ? { configType: 'graphql'; rest: AfterFirstWord<S> }
    : never;

type _ExtractMiddleware<S extends string> = Upper<S> extends `${string}MIDDLEWARE ${string}`
  ? _FindAndExtractMiddlewareList<S>
  : [];

type _FindAndExtractMiddlewareList<S extends string> = Upper<FirstWord<S>> extends 'MIDDLEWARE'
  ? _ParseMiddlewareList<_TrimToPermissions<AfterFirstWord<S>>>
  : S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends 'MIDDLEWARE'
      ? _ParseMiddlewareList<_TrimToPermissions<After>>
      : _FindAndExtractMiddlewareList<`${Word} ${After}`>
    : [];

type _TrimToPermissions<S extends string> = S extends `${infer B} PERMISSIONS ${string}`
  ? Trim<B>
  : S extends `${infer B} permissions ${string}`
    ? Trim<B>
    : Trim<S>;

type _ParseMiddlewareList<S extends string> = Trim<S> extends '' ? [] : _SplitMiddleware<Trim<S>>;

type _SplitMiddleware<
  S extends string,
  Acc extends string[] = []
> = S extends `${infer Item},${infer Rest}`
  ? HasUnclosedParen<Item> extends true
    ? _HandleMiddlewareParenItem<S, Acc>
    : _SplitMiddleware<Trim<Rest>, [...Acc, Trim<Item>]>
  : Trim<S> extends ''
    ? Acc
    : [...Acc, Trim<S>];

type _HandleMiddlewareParenItem<
  S extends string,
  Acc extends string[]
> = S extends `${infer Before})${infer After}`
  ? After extends `,${infer Rest}`
    ? _SplitMiddleware<Trim<Rest>, [...Acc, Trim<`${Before})`>]>
    : After extends ''
      ? [...Acc, Trim<`${Before})`>]
      : [...Acc, Trim<`${Before})`>, ..._SplitMiddleware<Trim<After>>]
  : [...Acc, Trim<S>];

type _ExtractPermissions<S extends string> = Upper<S> extends `${string}PERMISSIONS ${string}`
  ? _FindAndExtractPermissionsValue<S>
  : undefined;

type _FindAndExtractPermissionsValue<S extends string> = Upper<FirstWord<S>> extends 'PERMISSIONS'
  ? _GetPermissionsValue<AfterFirstWord<S>>
  : S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends 'PERMISSIONS'
      ? _GetPermissionsValue<After>
      : _FindAndExtractPermissionsValue<`${Word} ${After}`>
    : undefined;

type _GetPermissionsValue<S extends string> = Trim<S> extends `FULL${infer _Rest}`
  ? 'FULL'
  : Trim<S> extends `Full${infer _Rest}`
    ? 'FULL'
    : Trim<S> extends `full${infer _Rest}`
      ? 'FULL'
      : Trim<S> extends `NONE${infer _Rest}`
        ? 'NONE'
        : Trim<S> extends `None${infer _Rest}`
          ? 'NONE'
          : Trim<S> extends `none${infer _Rest}`
            ? 'NONE'
            : FirstWord<Trim<S>>;

type _ExtractTables<S extends string> = Upper<S> extends `${string}TABLES ${string}`
  ? _FindAndExtractTablesValue<S>
  : 'AUTO';

type _FindAndExtractTablesValue<S extends string> = Upper<FirstWord<S>> extends 'TABLES'
  ? _GetTablesValue<AfterFirstWord<S>>
  : S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends 'TABLES'
      ? _GetTablesValue<After>
      : _FindAndExtractTablesValue<`${Word} ${After}`>
    : 'AUTO';

type _GetTablesValue<S extends string> = Upper<FirstWord<Trim<S>>> extends 'AUTO'
  ? 'AUTO'
  : Upper<FirstWord<Trim<S>>> extends 'NONE'
    ? 'NONE'
    : Upper<FirstWord<Trim<S>>> extends 'INCLUDE'
      ? `INCLUDE ${_ExtractTablesList<AfterFirstWord<Trim<S>>>}`
      : Upper<FirstWord<Trim<S>>> extends 'EXCLUDE'
        ? `EXCLUDE ${_ExtractTablesList<AfterFirstWord<Trim<S>>>}`
        : 'AUTO';

type _ExtractTablesList<S extends string> = _TrimToFunctions<S>;

type _TrimToFunctions<S extends string> = S extends `${infer B} FUNCTIONS ${string}`
  ? Trim<B>
  : S extends `${infer B} Functions ${string}`
    ? Trim<B>
    : S extends `${infer B} functions ${string}`
      ? Trim<B>
      : Trim<S>;

type _ExtractFunctions<S extends string> = Upper<S> extends `${string}FUNCTIONS ${string}`
  ? _FindAndExtractFunctionsValue<S>
  : 'AUTO';

type _FindAndExtractFunctionsValue<S extends string> = Upper<FirstWord<S>> extends 'FUNCTIONS'
  ? _GetFunctionsValue<AfterFirstWord<S>>
  : S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends 'FUNCTIONS'
      ? _GetFunctionsValue<After>
      : _FindAndExtractFunctionsValue<`${Word} ${After}`>
    : 'AUTO';

type _GetFunctionsValue<S extends string> = Upper<FirstWord<Trim<S>>> extends 'AUTO'
  ? 'AUTO'
  : Upper<FirstWord<Trim<S>>> extends 'NONE'
    ? 'NONE'
    : Upper<FirstWord<Trim<S>>> extends 'INCLUDE'
      ? `INCLUDE ${_ExtractBracketedList<AfterFirstWord<Trim<S>>>}`
      : Upper<FirstWord<Trim<S>>> extends 'EXCLUDE'
        ? `EXCLUDE ${_ExtractBracketedList<AfterFirstWord<Trim<S>>>}`
        : 'AUTO';

type _ExtractBracketedList<S extends string> = Trim<S> extends `[${infer Content}]${string}`
  ? `[${Content}]`
  : FirstWord<Trim<S>>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    CONFIG: ParseDefineConfig<S>;
  }
}

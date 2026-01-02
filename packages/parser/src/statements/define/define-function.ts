import type { ExtractComment, Trim, Upper } from '../../utils';

/**
 * Represents a parsed function parameter with name and raw type string.
 * Type is stored as string to avoid deep recursion during parsing.
 */
export interface FunctionParam<Name extends string = string, TypeStr extends string = string> {
  name: Name;
  typeStr: TypeStr;
}

/**
 * Function permissions structure.
 */
export type FunctionPermissions = 'FULL' | 'NONE' | string;

/**
 * Represents a parsed DEFINE FUNCTION statement.
 * @see https://surrealdb.com/docs/surrealql/statements/define/function
 */
export interface FunctionResult<
  Name extends string = string,
  Params extends FunctionParam[] = FunctionParam[],
  Body extends string | undefined = string | undefined,
  Comment extends string | undefined = string | undefined,
  Permissions extends FunctionPermissions | undefined = FunctionPermissions | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'function';
  name: Name;
  params: Params;
  body: Body;
  comment: Comment;
  permissions: Permissions;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineFunction<S extends string> = _ParseFunction<S>;

// Main parser - simplified pattern matching
type _ParseFunction<S extends string> =
  Trim<S> extends `DEFINE FUNCTION ${infer Rest}`
    ? _ParseFunctionRest<Trim<Rest>>
    : Trim<S> extends `define function ${infer Rest}`
      ? _ParseFunctionRest<Trim<Rest>>
      : never;

// Handle OVERWRITE / IF NOT EXISTS modifiers
type _ParseFunctionRest<S extends string> =
  Upper<S> extends `OVERWRITE ${string}`
    ? S extends `${string} ${infer Rest}`
      ? _ParseFunctionSignature<Trim<Rest>, true, false>
      : never
    : Upper<S> extends `IF NOT EXISTS ${string}`
      ? S extends `${string} ${string} ${string} ${infer Rest}`
        ? _ParseFunctionSignature<Trim<Rest>, false, true>
        : never
      : _ParseFunctionSignature<S, false, false>;

// Parse function signature: fn::name(params) { body } [COMMENT] [PERMISSIONS]
type _ParseFunctionSignature<
  S extends string,
  OW extends boolean,
  INE extends boolean
> = S extends `fn::${infer NameAndRest}`
  ? _ParseFnName<NameAndRest, OW, INE>
  : S extends `${infer Name}(${infer Rest}`
    ? _ParseAfterName<Name, Rest, OW, INE>
    : _MakeFunctionResult<S, [], undefined, undefined, undefined, OW, INE>;

// Parse fn::name(...)
type _ParseFnName<
  S extends string,
  OW extends boolean,
  INE extends boolean
> = S extends `${infer Name}(${infer Rest}`
  ? _ParseAfterName<`fn::${Name}`, Rest, OW, INE>
  : _MakeFunctionResult<`fn::${S}`, [], undefined, undefined, undefined, OW, INE>;

// Parse params and body after opening paren
type _ParseAfterName<
  Name extends string,
  S extends string,
  OW extends boolean,
  INE extends boolean
> = S extends `${infer Params})${infer AfterParams}`
  ? _MakeFunctionResult<
      Name,
      _QuickParseParams<Params>,
      _ExtractBody<AfterParams>,
      ExtractComment<AfterParams>,
      _ExtractPerms<AfterParams>,
      OW,
      INE
    >
  : _MakeFunctionResult<Name, [], undefined, undefined, undefined, OW, INE>;

// Quick parameter parsing - optimized for common cases (0-3 params)
// Note: This doesn't handle commas inside default values (e.g., "a, b" in strings)
type _QuickParseParams<S extends string> =
  Trim<S> extends ''
    ? []
    : Trim<S> extends `${infer P1}, ${infer P2}, ${infer P3}`
      ? [_ParseParam<P1>, _ParseParam<P2>, _ParseParam<P3>]
      : Trim<S> extends `${infer P1},${infer P2},${infer P3}`
        ? [_ParseParam<P1>, _ParseParam<P2>, _ParseParam<P3>]
        : Trim<S> extends `${infer P1}, ${infer P2}`
          ? [_ParseParam<P1>, _ParseParam<P2>]
          : Trim<S> extends `${infer P1},${infer P2}`
            ? [_ParseParam<P1>, _ParseParam<P2>]
            : [_ParseParam<Trim<S>>];

// Parse single parameter: $name: type
// Stores type as string to avoid deep recursion from ParseDataType
type _ParseParam<S extends string> =
  Trim<S> extends ''
    ? FunctionParam<'', ''>
    : Trim<S> extends `$${infer Name}: ${infer Type}`
      ? FunctionParam<Trim<Name>, Trim<Type>>
      : Trim<S> extends `$${infer Name}:${infer Type}`
        ? FunctionParam<Trim<Name>, Trim<Type>>
        : Trim<S> extends `$${infer Name}`
          ? FunctionParam<Trim<Name>, 'unknown'>
          : FunctionParam<Trim<S>, 'unknown'>;

// Extract body - everything between { and } before COMMENT/PERMISSIONS
// Pattern: look for "} COMMENT" or "} PERMISSIONS" to find end of body
type _ExtractBody<S extends string> = _FindBody<Trim<S>>;

type _FindBody<S extends string> = S extends `${infer Body} COMMENT ${string}`
  ? _EnsureEndsWithBrace<Trim<Body>>
  : S extends `${infer Body} PERMISSIONS ${string}`
    ? _EnsureEndsWithBrace<Trim<Body>>
    : S extends `${infer Body} Comment ${string}`
      ? _EnsureEndsWithBrace<Trim<Body>>
      : S extends `${infer Body} Permissions ${string}`
        ? _EnsureEndsWithBrace<Trim<Body>>
        : S extends `${infer Body} comment ${string}`
          ? _EnsureEndsWithBrace<Trim<Body>>
          : S extends `${infer Body} permissions ${string}`
            ? _EnsureEndsWithBrace<Trim<Body>>
            : S extends `{${infer Inner}}`
              ? `{${Inner}}`
              : S extends `{${string}`
                ? S
                : undefined;

// Ensure body ends with }
type _EnsureEndsWithBrace<S extends string> = S extends `${string}}` ? S : undefined;

// Extract PERMISSIONS
type _ExtractPerms<S extends string> =
  Upper<S> extends `${string}PERMISSIONS FULL${string}`
    ? 'FULL'
    : Upper<S> extends `${string}PERMISSIONS NONE${string}`
      ? 'NONE'
      : S extends `${string}PERMISSIONS WHERE ${infer Cond}`
        ? `WHERE ${_TrimCond<Cond>}`
        : S extends `${string}permissions where ${infer Cond}`
          ? `WHERE ${_TrimCond<Cond>}`
          : undefined;

// Trim condition (stop at COMMENT)
type _TrimCond<S extends string> = S extends `${infer C} COMMENT ${string}`
  ? Trim<C>
  : S extends `${infer C} comment ${string}`
    ? Trim<C>
    : Trim<S>;

// Create result object
type _MakeFunctionResult<
  Name extends string,
  Params extends FunctionParam[],
  Body extends string | undefined,
  Comment extends string | undefined,
  Permissions extends FunctionPermissions | undefined,
  OW extends boolean,
  INE extends boolean
> = FunctionResult<Name, Params, Body, Comment, Permissions, OW, INE>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    FUNCTION: ParseDefineFunction<S>;
  }
}

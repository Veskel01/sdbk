import type {
  ExtractComment,
  ExtractSimplePermissions,
  FirstWord,
  HasIfNotExists,
  HasOverwrite,
  SkipIfNotExists,
  SkipOverwrite,
  Trim,
  Upper
} from '../../utils';

/**
 * Result type for parsed DEFINE PARAM statements.
 *
 * @template Name - The parameter name (without $)
 * @template Value - The parameter value expression
 * @template Permissions - Permission clause (none, full, or where condition)
 * @template Comment - Optional comment
 * @template Overwrite - Whether OVERWRITE modifier is present
 * @template IfNotExists - Whether IF NOT EXISTS modifier is present
 */
export interface ParamResult<
  Name extends string = string,
  Value extends string | undefined = string | undefined,
  Permissions extends string | undefined = string | undefined,
  Comment extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'param';
  name: Name;
  value: Value;
  permissions: Permissions;
  comment: Comment;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineParam<S extends string> = _ParseParam<Trim<S>>;

type _ParseParam<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'PARAM'
      ? _ExtractModifiersAndName<Trim<C>>
      : never
    : never
  : never;

type _ExtractModifiersAndName<S extends string> = HasOverwrite<S> extends true
  ? _ParamBody<SkipOverwrite<S>, true, false>
  : HasIfNotExists<S> extends true
    ? _ParamBody<SkipIfNotExists<S>, false, true>
    : _ParamBody<S, false, false>;

// Parse: $name VALUE ... [COMMENT ...] [PERMISSIONS ...]
type _ParamBody<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = S extends `$${infer Name} ${infer Rest}`
  ? ParamResult<
      _ExtractParamName<Name>,
      _ExtractParamValue<Rest>,
      ExtractSimplePermissions<Rest>,
      ExtractComment<Rest>,
      Overwrite,
      IfNotExists
    >
  : S extends `$${infer Name}`
    ? ParamResult<Name, undefined, undefined, undefined, Overwrite, IfNotExists>
    : ParamResult<FirstWord<S>, undefined, undefined, undefined, Overwrite, IfNotExists>;

// Extract just the param name (before any space)
type _ExtractParamName<S extends string> = S extends `${infer N} ${string}` ? N : S;

// Extract VALUE clause content (preserving case)
type _ExtractParamValue<S extends string> = Upper<S> extends `VALUE ${string}`
  ? _ExtractValueFromOriginal<S>
  : Upper<S> extends `${string} VALUE ${string}`
    ? _ExtractValueFromOriginal<S>
    : undefined;

type _ExtractValueFromOriginal<S extends string> = S extends `VALUE ${infer Rest}`
  ? _TrimValueUntilKeyword<Rest>
  : S extends `value ${infer Rest}`
    ? _TrimValueUntilKeyword<Rest>
    : S extends `${string} VALUE ${infer Rest}`
      ? _TrimValueUntilKeyword<Rest>
      : S extends `${string} value ${infer Rest}`
        ? _TrimValueUntilKeyword<Rest>
        : undefined;

type _TrimValueUntilKeyword<S extends string> = S extends `${infer V} COMMENT ${string}`
  ? Trim<V>
  : S extends `${infer V} comment ${string}`
    ? Trim<V>
    : S extends `${infer V} PERMISSIONS ${string}`
      ? Trim<V>
      : S extends `${infer V} permissions ${string}`
        ? Trim<V>
        : Trim<S>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    PARAM: ParseDefineParam<S>;
  }
}

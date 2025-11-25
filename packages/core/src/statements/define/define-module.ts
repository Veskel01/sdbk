import type {
  FirstWord,
  HasIfNotExists,
  HasOverwrite,
  ParseQuotedString,
  SkipIfNotExists,
  SkipOverwrite,
  Trim,
  Upper
} from '../../utils';

/**
 * Result type for parsed DEFINE MODULE statements.
 *
 * @template Name - The full module name (e.g., "mod::test")
 * @template FileName - The .surli file pointer
 * @template Overwrite - Whether OVERWRITE modifier is present
 * @template IfNotExists - Whether IF NOT EXISTS modifier is present
 */
export interface ModuleResult<
  Name extends string = string,
  FileName extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'module';
  name: Name;
  fileName: FileName;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineModule<S extends string> = _ParseModule<Trim<S>>;

type _ParseModule<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'MODULE'
      ? _ExtractModifiersAndName<Trim<C>>
      : never
    : never
  : never;

type _ExtractModifiersAndName<S extends string> = HasOverwrite<S> extends true
  ? _ParseModuleBody<SkipOverwrite<S>, true, false>
  : HasIfNotExists<S> extends true
    ? _ParseModuleBody<SkipIfNotExists<S>, false, true>
    : _ParseModuleBody<S, false, false>;

type _ParseModuleBody<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = Upper<S> extends `${string} AS ${string}`
  ? _ExtractNameAndFile<S, Overwrite, IfNotExists>
  : ModuleResult<FirstWord<S>, undefined, Overwrite, IfNotExists>;

type _ExtractNameAndFile<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = S extends `${infer Name} AS ${infer FileName}`
  ? ModuleResult<Trim<Name>, ParseQuotedString<Trim<FileName>>, Overwrite, IfNotExists>
  : S extends `${infer Name} as ${infer FileName}`
    ? ModuleResult<Trim<Name>, ParseQuotedString<Trim<FileName>>, Overwrite, IfNotExists>
    : ModuleResult<FirstWord<S>, undefined, Overwrite, IfNotExists>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    MODULE: ParseDefineModule<S>;
  }
}

import type {
  CreateTokenizer,
  Digit,
  IsTokenError,
  Letter,
  TokenizerIsValid,
  TokenizerParse,
  Whitespace
} from './tokenizer';
import type {
  AnyGeometryType,
  GeometryTypeMap,
  NumberLiteralType,
  ObjectLiteralType,
  RecordIdType,
  StringLiteralType,
  TupleLiteralType,
  TypeMap
} from './type-map';
import type { UnwrapDataType } from './unwrap';
import type { Inc, Prettify, Trim } from './util';

/** Characters allowed in SurrealDB type definition strings */
export type TypeDefChars =
  | Letter
  | Digit
  | Whitespace
  | '<'
  | '>'
  | '{'
  | '}'
  | '['
  | ']'
  | '|'
  | ','
  | ':'
  | '"'
  | "'"
  | '-'
  | '_'
  | '.';

export type TypeDefTokenizer = CreateTokenizer<
  TypeDefChars,
  `Invalid character '$char' in type definition`
>;

export type ValidateTypeDef<S extends string> = TokenizerParse<TypeDefTokenizer, S>;
export type IsValidTypeDef<S extends string> = TokenizerIsValid<TypeDefTokenizer, S>;

export interface TypeDepthExceededError {
  readonly __error: 'TypeDepthExceeded';
  readonly message: 'Type nesting depth exceeded maximum of 15 levels';
}

export interface UnknownTypeError<T extends string = string> {
  readonly __error: 'UnknownType';
  readonly type: T;
  readonly message: `Unknown type '${T}'`;
}

export type IsInferError<T> = T extends { readonly __error: string } ? true : false;

/** Remove all whitespace characters from string */
type Normalize<S extends string> = S extends `${infer A} ${infer B}`
  ? Normalize<`${A}${B}`>
  : S extends `${infer A}\n${infer B}`
    ? Normalize<`${A}${B}`>
    : S extends `${infer A}\t${infer B}`
      ? Normalize<`${A}${B}`>
      : S extends `${infer A}\r${infer B}`
        ? Normalize<`${A}${B}`>
        : S;

/** Find matching closing bracket, returns [inner, rest] */
type MatchAngle<S extends string, D extends number = 1, Acc extends string = ''> = D extends 0
  ? [Acc, S]
  : S extends `<${infer R}`
    ? MatchAngle<R, Inc<D>, `${Acc}<`>
    : S extends `>${infer R}`
      ? D extends 1
        ? [Acc, R]
        : MatchAngle<R, Prev<D>, `${Acc}>`>
      : S extends `${infer C}${infer R}`
        ? MatchAngle<R, D, `${Acc}${C}`>
        : never;

type MatchBrace<S extends string, D extends number = 1, Acc extends string = ''> = D extends 0
  ? [Acc, S]
  : S extends `{${infer R}`
    ? MatchBrace<R, Inc<D>, `${Acc}{`>
    : S extends `}${infer R}`
      ? D extends 1
        ? [Acc, R]
        : MatchBrace<R, Prev<D>, `${Acc}}`>
      : S extends `${infer C}${infer R}`
        ? MatchBrace<R, D, `${Acc}${C}`>
        : never;

type MatchBracket<S extends string, D extends number = 1, Acc extends string = ''> = D extends 0
  ? [Acc, S]
  : S extends `[${infer R}`
    ? MatchBracket<R, Inc<D>, `${Acc}[`>
    : S extends `]${infer R}`
      ? D extends 1
        ? [Acc, R]
        : MatchBracket<R, Prev<D>, `${Acc}]`>
      : S extends `${infer C}${infer R}`
        ? MatchBracket<R, D, `${Acc}${C}`>
        : never;

/** Decrement for depth tracking */
type Prev<N extends number> = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14][N];

/** Split at top-level | only */
type SplitUnion<S extends string, Acc extends string = ''> = S extends `${infer C}${infer R}`
  ? C extends '|'
    ? [Trim<Acc>, Trim<R>]
    : C extends '<'
      ? MatchAngle<R> extends [infer Inner extends string, infer Rest extends string]
        ? SplitUnion<Rest, `${Acc}<${Inner}>`>
        : [Trim<`${Acc}${S}`>, '']
      : C extends '{'
        ? MatchBrace<R> extends [infer Inner extends string, infer Rest extends string]
          ? SplitUnion<Rest, `${Acc}{${Inner}}`>
          : [Trim<`${Acc}${S}`>, '']
        : C extends '['
          ? MatchBracket<R> extends [infer Inner extends string, infer Rest extends string]
            ? SplitUnion<Rest, `${Acc}[${Inner}]`>
            : [Trim<`${Acc}${S}`>, '']
          : C extends '"'
            ? R extends `${infer Str}"${infer Rest}`
              ? SplitUnion<Rest, `${Acc}"${Str}"`>
              : [Trim<`${Acc}${S}`>, '']
            : C extends "'"
              ? R extends `${infer Str}'${infer Rest}`
                ? SplitUnion<Rest, `${Acc}'${Str}'`>
                : [Trim<`${Acc}${S}`>, '']
              : SplitUnion<R, `${Acc}${C}`>
  : [Trim<Acc>, ''];

/** Split at top-level , only */
type SplitComma<S extends string, Acc extends string = ''> = S extends `${infer C}${infer R}`
  ? C extends ','
    ? [Trim<Acc>, Trim<R>]
    : C extends '<'
      ? MatchAngle<R> extends [infer Inner extends string, infer Rest extends string]
        ? SplitComma<Rest, `${Acc}<${Inner}>`>
        : [Trim<`${Acc}${S}`>, '']
      : C extends '{'
        ? MatchBrace<R> extends [infer Inner extends string, infer Rest extends string]
          ? SplitComma<Rest, `${Acc}{${Inner}}`>
          : [Trim<`${Acc}${S}`>, '']
        : C extends '['
          ? MatchBracket<R> extends [infer Inner extends string, infer Rest extends string]
            ? SplitComma<Rest, `${Acc}[${Inner}]`>
            : [Trim<`${Acc}${S}`>, '']
          : C extends '"'
            ? R extends `${infer Str}"${infer Rest}`
              ? SplitComma<Rest, `${Acc}"${Str}"`>
              : [Trim<`${Acc}${S}`>, '']
            : C extends "'"
              ? R extends `${infer Str}'${infer Rest}`
                ? SplitComma<Rest, `${Acc}'${Str}'`>
                : [Trim<`${Acc}${S}`>, '']
              : SplitComma<R, `${Acc}${C}`>
  : [Trim<Acc>, ''];

/** Split at top-level : only (for object fields) */
type SplitColon<S extends string, Acc extends string = ''> = S extends `${infer C}${infer R}`
  ? C extends ':'
    ? [Trim<Acc>, Trim<R>]
    : C extends '<'
      ? MatchAngle<R> extends [infer Inner extends string, infer Rest extends string]
        ? SplitColon<Rest, `${Acc}<${Inner}>`>
        : never
      : C extends '{'
        ? MatchBrace<R> extends [infer Inner extends string, infer Rest extends string]
          ? SplitColon<Rest, `${Acc}{${Inner}}`>
          : never
        : C extends '['
          ? MatchBracket<R> extends [infer Inner extends string, infer Rest extends string]
            ? SplitColon<Rest, `${Acc}[${Inner}]`>
            : never
          : SplitColon<R, `${Acc}${C}`>
  : never;

/** Combine two types, but propagate errors */
type CombineOrError<A, B> = IsInferError<A> extends true
  ? A
  : IsInferError<B> extends true
    ? B
    : A | B;

/** Infer union types - errors propagate to entire result */
type InferUnion<S extends string, Depth extends number> = Depth extends 15
  ? TypeDepthExceededError
  : SplitUnion<Normalize<S>> extends [infer First extends string, infer Rest extends string]
    ? Rest extends ''
      ? InferSingle<First, Depth>
      : CombineOrError<InferSingle<First, Depth>, InferUnion<Rest, Depth>>
    : InferSingle<S, Depth>;

/** Infer single type (no unions at top level) */
type InferSingle<S extends string, Depth extends number> = Trim<S> extends infer T extends string
  ? T extends ''
    ? never
    : T extends `${infer N extends number}`
      ? NumberLiteralType<N>
      : T extends `"${infer Content}"`
        ? StringLiteralType<Content>
        : T extends `'${infer Content}'`
          ? StringLiteralType<Content>
          : T extends `[${infer Body}]`
            ? TupleLiteralType<InferTuple<Body, Depth>>
            : T extends `{${infer Body}}`
              ? ObjectLiteralType<InferObject<Body, Depth>>
              : InferNamed<T, Depth>
  : never;

/** Infer named types (scalars, generics) */
type InferNamed<S extends string, Depth extends number> = Lowercase<S> extends infer L extends
  string
  ? L extends keyof TypeMap
    ? TypeMap[L]
    : L extends `array<${infer Inner}>`
      ? InferUnion<StripMax<Inner>, Inc<Depth>>[]
      : L extends `set<${infer Inner}>`
        ? InferUnion<StripMax<Inner>, Inc<Depth>>[]
        : L extends `option<${infer Inner}>`
          ? InferUnion<Inner, Inc<Depth>> | null
          : L extends `record<${infer Tables}>`
            ? InferRecords<Tables>
            : L extends `geometry<${infer Subtypes}>`
              ? InferGeometries<Subtypes>
              : UnknownTypeError<S>
  : UnknownTypeError<S>;

/** Strip max length from array/set */
type StripMax<S extends string> = SplitComma<S> extends [
  infer Type extends string,
  infer Rest extends string
]
  ? Rest extends ''
    ? Type
    : Type
  : S;

/** Infer tuple items */
type InferTuple<S extends string, Depth extends number> = Trim<S> extends ''
  ? []
  : SplitComma<Normalize<S>> extends [infer First extends string, infer Rest extends string]
    ? Rest extends ''
      ? [InferUnion<First, Inc<Depth>>]
      : [InferUnion<First, Inc<Depth>>, ...InferTuple<Rest, Depth>]
    : [InferUnion<S, Inc<Depth>>];

/** Infer object fields */
type InferObject<S extends string, Depth extends number> = Trim<S> extends ''
  ? Record<string, never>
  : Prettify<InferFields<Normalize<S>, Depth>>;

/** Infer object fields recursively */
type InferFields<S extends string, Depth extends number> = S extends ''
  ? unknown
  : SplitComma<S> extends [infer Field extends string, infer Rest extends string]
    ? SplitColon<Field> extends [infer Key extends string, infer Value extends string]
      ? { [K in Trim<Key>]: InferUnion<Value, Inc<Depth>> } & (Rest extends ''
          ? unknown
          : InferFields<Rest, Depth>)
      : unknown
    : SplitColon<S> extends [infer Key extends string, infer Value extends string]
      ? { [K in Trim<Key>]: InferUnion<Value, Inc<Depth>> }
      : unknown;

/** Infer record table unions */
type InferRecords<S extends string> = SplitUnion<Normalize<S>> extends [
  infer First extends string,
  infer Rest extends string
]
  ? Rest extends ''
    ? RecordIdType<Lowercase<Trim<First>>>
    : RecordIdType<Lowercase<Trim<First>>> | InferRecords<Rest>
  : RecordIdType<Lowercase<Trim<S>>>;

/** Infer geometry subtype unions */
type InferGeometries<S extends string> = SplitUnion<Normalize<S>> extends [
  infer First extends string,
  infer Rest extends string
]
  ? Rest extends ''
    ? MapGeometry<Lowercase<Trim<First>>>
    : MapGeometry<Lowercase<Trim<First>>> | InferGeometries<Rest>
  : MapGeometry<Lowercase<Trim<S>>>;

/** Map geometry subtype */
type MapGeometry<S extends string> = S extends keyof GeometryTypeMap
  ? GeometryTypeMap[S]
  : AnyGeometryType;

/**
 * Infer TypeScript type from SurrealDB data type definition.
 *
 * @typeParam S - SurrealDB type definition string
 */
export type InferDataType<S extends string> = ValidateTypeDef<S> extends infer V
  ? IsTokenError<V> extends true
    ? V
    : InferUnion<S, 0>
  : never;

/** Infer type without validation (faster, no error checking) */
export type InferDataTypeUnsafe<S extends string> = InferUnion<S, 0>;

/**
 * Infer and unwrap TypeScript type from SurrealDB data type definition string.
 * Combines `InferDataType` and `UnwrapDataType` in one step.
 *
 * @typeParam S - SurrealDB type definition string (e.g., 'string', 'int', 'record<users>')
 *
 * @example
 * ```ts
 * type Name = InferValueType<'string'>;        // string
 * type Age = InferValueType<'int'>;            // number
 * type User = InferValueType<'record<users>'>; // RecordId<'users'>
 * type Tags = InferValueType<'array<string>'>; // string[]
 * ```
 */
export type InferDataValueType<S extends string> = UnwrapDataType<InferDataType<S>>;

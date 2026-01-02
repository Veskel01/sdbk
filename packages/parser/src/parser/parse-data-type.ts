import type {
  CollectionMap,
  Duration,
  Geometry,
  GeometryMap,
  Range,
  RecordId,
  TypeMap
} from '../schema/type-map';
import type { Dec, FirstWord, Inc, Trim, Upper } from '../utils';
import type { ParseErrors } from './errors';
import type {
  IsTokenError as _IsTokenError,
  FieldTypeTokenizer,
  TokenizerParse
} from './tokenizer';

/** Validate input using tokenizer */
type _Validate<S extends string> = TokenizerParse<FieldTypeTokenizer, Trim<S>>;

/**
 * Parses a SurrealQL type definition string into its corresponding TypeScript type at compile time.
 *
 * @remarks
 * - If the input contains characters not allowed by {@link FieldTypeTokenizer}, the result is a {@link TokenError}.
 * - If the type nesting exceeds 10 levels, the result is {@link ParseErrors.TypeDepthExceeded}.
 * - Otherwise the resulting type is a structural TypeScript representation (primitives, arrays, sets, records, tuples, object literals and unions).
 *
 * @typeParam S - SurrealQL `TYPE` clause content (for example `'array<string>'` or `'record<user|post>'`).
 *
 * @example
 * ```ts
 * // Inferring a field's runtime type from its SurrealQL declaration
 * type UserId = ParseDataType<'record<user>'>;             // RecordId<'user'>
 * type Tags   = ParseDataType<'array<string>'>;            // string[]
 * type State  = ParseDataType<'\"draft\" | \"published\"'>; // 'draft' | 'published'
 * ```
 */
export type ParseDataType<S extends string> =
  _Validate<S> extends infer V
    ? _IsTokenError<V> extends true
      ? V
      : V extends string
        ? _ParseUnion<V, 0>
        : never
    : never;

/**
 * Parser state for tracking nesting depth and string context.
 * Tracks `<>`, `{}`, `[]`, `()` and string literals.
 */
interface SplitState<
  Acc extends string = '',
  Angle extends number = 0,
  Brace extends number = 0,
  Bracket extends number = 0,
  Paren extends number = 0,
  InStr extends boolean = false,
  StrChar extends string = ''
> {
  acc: Acc;
  angle: Angle;
  brace: Brace;
  bracket: Bracket;
  paren: Paren;
  inStr: InStr;
  strChar: StrChar;
}

/** Generic state type alias for cleaner constraints */
type _AnyState = SplitState<string, number, number, number, number, boolean, string>;

/** Initial state for splitter */
type _InitState = SplitState<'', 0, 0, 0, 0, false, ''>;

/** Check if parser is at top level (not inside any brackets or strings) */
type _IsTopLevel<S extends _AnyState> = S['inStr'] extends true
  ? false
  : S['angle'] extends 0
    ? S['brace'] extends 0
      ? S['bracket'] extends 0
        ? S['paren'] extends 0
          ? true
          : false
        : false
      : false
    : false;

/** Add character to accumulator */
type _AddChar<S extends _AnyState, C extends string> = SplitState<
  `${S['acc']}${C}`,
  S['angle'],
  S['brace'],
  S['bracket'],
  S['paren'],
  S['inStr'],
  S['strChar']
>;

/** Handle opening bracket - increment depth */
type _OpenBracket<
  S extends _AnyState,
  C extends string,
  Field extends 'angle' | 'brace' | 'bracket' | 'paren'
> = SplitState<
  `${S['acc']}${C}`,
  Field extends 'angle' ? Inc<S['angle']> : S['angle'],
  Field extends 'brace' ? Inc<S['brace']> : S['brace'],
  Field extends 'bracket' ? Inc<S['bracket']> : S['bracket'],
  Field extends 'paren' ? Inc<S['paren']> : S['paren'],
  false,
  ''
>;

/** Handle closing bracket - decrement depth */
type _CloseBracket<
  S extends _AnyState,
  C extends string,
  Field extends 'angle' | 'brace' | 'bracket' | 'paren'
> = SplitState<
  `${S['acc']}${C}`,
  Field extends 'angle' ? Dec<S['angle']> : S['angle'],
  Field extends 'brace' ? Dec<S['brace']> : S['brace'],
  Field extends 'bracket' ? Dec<S['bracket']> : S['bracket'],
  Field extends 'paren' ? Dec<S['paren']> : S['paren'],
  false,
  ''
>;

/** Handle quote character - toggle string mode */
type _HandleQuote<S extends _AnyState, C extends '"' | "'"> = S['inStr'] extends true
  ? C extends S['strChar']
    ? SplitState<`${S['acc']}${C}`, S['angle'], S['brace'], S['bracket'], S['paren'], false, ''>
    : _AddChar<S, C>
  : SplitState<`${S['acc']}${C}`, S['angle'], S['brace'], S['bracket'], S['paren'], true, C>;

/**
 * Process single character and return new state.
 * Handles: string delimiters, bracket nesting, regular characters.
 */
type _ProcessChar<S extends _AnyState, C extends string> = C extends '"' | "'"
  ? _HandleQuote<S, C>
  : S['inStr'] extends true
    ? _AddChar<S, C>
    : C extends '<'
      ? _OpenBracket<S, C, 'angle'>
      : C extends '>'
        ? _CloseBracket<S, C, 'angle'>
        : C extends '{'
          ? _OpenBracket<S, C, 'brace'>
          : C extends '}'
            ? _CloseBracket<S, C, 'brace'>
            : C extends '['
              ? _OpenBracket<S, C, 'bracket'>
              : C extends ']'
                ? _CloseBracket<S, C, 'bracket'>
                : C extends '('
                  ? _OpenBracket<S, C, 'paren'>
                  : C extends ')'
                    ? _CloseBracket<S, C, 'paren'>
                    : _AddChar<S, C>;

/**
 * Generic splitter that finds first top-level occurrence of delimiter.
 * Returns `[before, after]` if found, or just the accumulated string if not found.
 */
type _SplitAt<
  Input extends string,
  Delim extends string,
  State extends _AnyState = _InitState,
  ReturnAcc extends 'string' | 'tuple' = 'string'
> = Input extends `${infer C}${infer Rest}`
  ? C extends Delim
    ? _IsTopLevel<State> extends true
      ? [Trim<State['acc']>, Trim<Rest>]
      : _SplitAt<Rest, Delim, _ProcessChar<State, C> & _AnyState, ReturnAcc>
    : _SplitAt<Rest, Delim, _ProcessChar<State, C> & _AnyState, ReturnAcc>
  : ReturnAcc extends 'tuple'
    ? [Trim<State['acc']>, '']
    : State['acc'];

/**
 * Split string into array at top-level delimiter occurrences.
 * Used for parsing comma-separated items in tuples and objects.
 */
type _SplitAll<Input extends string, Delim extends string, Acc extends string[] = []> = _SplitAt<
  Input,
  Delim,
  _InitState,
  'tuple'
> extends [infer First extends string, infer Rest extends string]
  ? Rest extends ''
    ? [...Acc, First]
    : _SplitAll<Rest, Delim, [...Acc, First]>
  : Acc;

/**
 * Entry point for parsing types that may contain unions (`|`).
 * Splits at top-level `|` and creates a TypeScript union type.
 */
type _ParseUnion<S extends string, Depth extends number> = Depth extends 10
  ? ParseErrors.TypeDepthExceeded
  : _SplitUnion<S> extends [infer First extends string, infer Rest extends string]
    ? _ParseSingleType<First, Depth> | _ParseUnion<Rest, Depth>
    : _ParseSingleType<S, Depth>;

/**
 * Split string at first top-level `|` (not inside `<>`, `{}`, `[]`, `()`, strings).
 * Returns `[before, after]` or the original string if no `|` found.
 */
type _SplitUnion<S extends string> = _SplitAt<S, '|'>;

/**
 * Parse a single type (no top-level `|`).
 * Handles literals (numbers, strings, objects, tuples) and standard types.
 */
type _ParseSingleType<S extends string, Depth extends number> = Trim<S> extends infer T extends
  string
  ? // Number literal: 9, 42, -5
    T extends `${infer N extends number}`
    ? N
    : // String literal with double quotes: "nine"
      T extends `"${infer Content}"`
      ? Content
      : // String literal with single quotes: 'nine'
        T extends `'${infer Content}'`
        ? Content
        : // Tuple literal: [T, U, V]
          T extends `[${infer Body}]`
          ? _ParseTuple<Body, Depth>
          : // Object literal: { key: type, ... }
            T extends `{${infer Body}}`
            ? _ParseObjectLiteral<Body, Depth>
            : // Standard type (delegates to mapper)
              _MapType<T, Depth>
  : unknown;

/**
 * Parse tuple body: `T, U, V` → [T, U, V]
 */
type _ParseTuple<S extends string, Depth extends number> = _ParseTupleItems<
  _SplitAll<Trim<S>, ','>,
  Depth
>;

/**
 * Recursively parse tuple items.
 */
type _ParseTupleItems<Items extends string[], Depth extends number> = Items extends [
  infer First extends string,
  ...infer Rest extends string[]
]
  ? _ParseUnion<Trim<First>, Inc<Depth>> extends infer T
    ? _IsTokenError<T> extends true
      ? T
      : [T, ..._ParseTupleItems<Rest, Depth>]
    : never
  : [];

/**
 * Parse object literal body: `key: type, key2: type2`
 * Uses Prettify to flatten intersection into single object
 */
type _ParseObjectLiteral<S extends string, Depth extends number> = Prettify<
  _ParseObjectFields<Trim<S>, Depth>
>;

/**
 * Recursively parse object fields separated by commas.
 */
type _ParseObjectFields<S extends string, Depth extends number> = S extends ''
  ? {}
  : _SplitObjectField<S> extends [
        infer Key extends string,
        infer Type extends string,
        infer Rest extends string
      ]
    ? { [K in Trim<Key>]: _ParseUnion<Trim<Type>, Inc<Depth>> } & _ParseObjectFields<Rest, Depth>
    : {};

/** Flatten intersection types into a single object type */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Split first field from object body.
 * Returns [key, type, rest] or fails.
 */
type _SplitObjectField<S extends string> = S extends `${infer Key}:${infer AfterColon}`
  ? _ExtractFieldType<AfterColon> extends [infer Type extends string, infer Rest extends string]
    ? [Key, Type, Rest]
    : never
  : never;

/**
 * Extract field type value, stopping at top-level comma or end.
 * Uses generic splitter with 'tuple' mode to always return [value, rest].
 */
type _ExtractFieldType<S extends string> = _SplitAt<S, ',', _InitState, 'tuple'>;

/**
 * Internal type mapper with depth tracking for recursion prevention.
 * Optimized with early returns for common types.
 */
type _MapType<S extends string, Depth extends number = 0> = Depth extends 10
  ? ParseErrors.TypeDepthExceeded
  : // Fast path for common primitive types (no recursion needed)
    _FastMap<Lowercase<S>> extends infer Fast
    ? [Fast] extends [never]
      ? _MapComplex<S, Depth>
      : Fast
    : _MapComplex<S, Depth>;

/**
 * Fast lookup for simple types without generic parameters.
 * Performance optimization: avoids complex pattern matching for common cases.
 */
type _FastMap<S extends string> = S extends keyof TypeMap ? TypeMap[S] : never;

/**
 * Complex type mapping for generic/parameterized types.
 * Uses CollectionTypeMap for array, set, option mappings.
 */
type _MapComplex<S extends string, Depth extends number> = Upper<S> extends `ARRAY<${
  string // Array types: array<T> or array<T, N>
}>`
  ? _MapCollection<'array', _MapType<_Inner<S>, Inc<Depth>>>
  : Upper<S> extends `ARRAY<${string}>${string}`
    ? _MapCollection<'array', _MapType<_Inner<S>, Inc<Depth>>>
    : // Set types: set<T> or set<T, N> - maps to array (SurrealDB returns sets as arrays)
      Upper<S> extends `SET<${string}>`
      ? _MapCollection<'set', _MapType<_Inner<S>, Inc<Depth>>>
      : Upper<S> extends `SET<${string}>${string}`
        ? _MapCollection<'set', _MapType<_Inner<S>, Inc<Depth>>>
        : // Option types: option<T> (nullable)
          Upper<S> extends `OPTION<${string}>`
          ? _MapCollection<'option', _MapType<_Inner<S>, Inc<Depth>>>
          : Upper<S> extends `OPTION<${string}>${string}`
            ? _MapCollection<'option', _MapType<_Inner<S>, Inc<Depth>>>
            : // Record types: record<table> or record<table|table2>
              Upper<S> extends `RECORD<${infer Table}>`
              ? _ExtractTableName<Table>
              : Upper<S> extends `RECORD<${infer Table}>${string}`
                ? _ExtractTableName<Table>
                : // Range types: range<T>
                  Upper<S> extends `RANGE<${infer Inner}>`
                  ? Range<_MapType<Trim<Inner>, Inc<Depth>>>
                  : Upper<S> extends `RANGE<${infer Inner}>${string}`
                    ? Range<_MapType<Trim<Inner>, Inc<Depth>>>
                    : // Plain range without parameter
                      Upper<S> extends 'RANGE'
                      ? Range
                      : // Duration types: duration<subtype>
                        Upper<S> extends `DURATION<${infer Subtype}>`
                        ? Duration<Lowercase<Trim<Subtype>>>
                        : Upper<S> extends `DURATION<${string}>${string}`
                          ? Duration<string>
                          : // Geometry types: geometry<subtype>
                            Upper<S> extends `GEOMETRY<${infer Subtype}>`
                            ? _MapGeometrySubtype<Lowercase<Trim<Subtype>>>
                            : Upper<S> extends `GEOMETRY<${string}>${string}`
                              ? Geometry
                              : // Plain geometry without parameter
                                Upper<S> extends 'GEOMETRY'
                                ? TypeMap['geometry']
                                : // Literal types: literal<value>
                                  Upper<S> extends `LITERAL<${string}>`
                                  ? _ParseLiteral<_Inner<S>>
                                  : // Plain 'record' without parameter
                                    Upper<S> extends 'RECORD'
                                    ? RecordId
                                    : // Fallback to basic type lookup
                                      _Map<Lowercase<FirstWord<S>>>;

/**
 * Parse literal content: handles strings, numbers, and identifiers.
 */
type _ParseLiteral<S extends string> =
  Trim<S> extends `"${infer V}"`
    ? V
    : Trim<S> extends `'${infer V}'`
      ? V
      : Trim<S> extends `${infer N extends number}`
        ? N
        : Trim<S>;

/**
 * Extracts table name(s) from record type parameter.
 * Supports union types: `record<user|post>` → `RecordId<'user'> | RecordId<'post'>`
 */
type _ExtractTableName<S extends string> = _SplitTableNames<Trim<S>>;

/**
 * Recursively splits table names by pipe separator and creates a union type.
 */
type _SplitTableNames<S extends string> = S extends `${infer First}|${infer Rest}`
  ? RecordId<Lowercase<Trim<First>>> | _SplitTableNames<Rest>
  : RecordId<Lowercase<Trim<S>>>;

/**
 * Extracts the inner type parameter from a generic type.
 * Example: `array<string>` → `string`
 */
type _Inner<S extends string> = S extends `${string}<${infer Rest}`
  ? _ExtractBalanced<Rest, '', 1>
  : never;

/**
 * Extracts balanced content between angle brackets.
 * Handles nested generics correctly.
 */
type _ExtractBalanced<
  S extends string,
  Acc extends string,
  Depth extends number
> = S extends `${infer Char}${infer Rest}`
  ? Char extends '<'
    ? _ExtractBalanced<Rest, `${Acc}<`, Inc<Depth>>
    : Char extends '>'
      ? Depth extends 1
        ? _StripExtraParams<Acc>
        : _ExtractBalanced<Rest, `${Acc}>`, Dec<Depth>>
      : _ExtractBalanced<Rest, `${Acc}${Char}`, Depth>
  : Acc;

/**
 * Strips extra parameters from type parameter (e.g., max length in `array<string, 100>`).
 */
type _StripExtraParams<S extends string> = _StripAtLevel<S, '', 0>;

/**
 * Helper for stripping parameters at the correct nesting level.
 */
type _StripAtLevel<
  S extends string,
  Acc extends string,
  Depth extends number
> = S extends `${infer Char}${infer Rest}`
  ? Char extends '<'
    ? _StripAtLevel<Rest, `${Acc}<`, Inc<Depth>>
    : Char extends '>'
      ? _StripAtLevel<Rest, `${Acc}>`, Dec<Depth>>
      : Char extends ','
        ? Depth extends 0
          ? Trim<Acc>
          : _StripAtLevel<Rest, `${Acc},`, Depth>
        : _StripAtLevel<Rest, `${Acc}${Char}`, Depth>
  : Trim<Acc>;

/** Maps type name to TypeMap entry, returns `unknown` for unrecognized types */
type _Map<T extends string> = T extends keyof TypeMap ? TypeMap[T] : unknown;

/**
 * Maps geometry subtype string to specific Geometry interface.
 * Uses GeometryMap as single source of truth.
 * @see https://surrealdb.com/docs/surrealql/datamodel/geometries
 */
type _MapGeometrySubtype<S extends string> = S extends keyof GeometryMap
  ? GeometryMap[S]
  : Geometry;

/**
 * Maps collection type to its TypeScript representation with inner type.
 * Uses CollectionMap as single source of truth.
 */
type _MapCollection<Kind extends keyof CollectionMap, Inner> = Kind extends 'array'
  ? Inner[]
  : Kind extends 'set'
    ? Inner[]
    : Kind extends 'option'
      ? Inner | null
      : never;

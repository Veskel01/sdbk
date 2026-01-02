import type {
  AfterFirstWord,
  ExtractComment,
  FirstWord,
  HasUnclosedParen,
  Trim,
  Upper
} from '../../utils';

/**
 * Available tokenizer types in SurrealDB.
 * @see https://surrealdb.com/docs/surrealql/statements/define/analyzer#tokenizers
 */
export type TokenizerType = 'blank' | 'camel' | 'class' | 'punct';

/**
 * Available filter types in SurrealDB.
 * Some filters accept parameters (e.g., edgengram(1,3), snowball(english)).
 * @see https://surrealdb.com/docs/surrealql/statements/define/analyzer#filters
 */
export type FilterType =
  | 'ascii'
  | 'lowercase'
  | 'uppercase'
  | `edgengram(${number},${number})`
  | `mapper(${string})`
  | `ngram(${number},${number})`
  | `snowball(${string})`;

/**
 * Result of parsing a DEFINE ANALYZER statement.
 */
export interface AnalyzerResult<
  Name extends string = string,
  Function extends string | undefined = string | undefined,
  Tokenizers extends string[] = string[],
  Filters extends string[] = string[],
  Comment extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'analyzer';
  name: Name;
  function: Function;
  tokenizers: Tokenizers;
  filters: Filters;
  comment: Comment;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineAnalyzer<S extends string> = _ParseAnalyzer<Trim<S>>;

type _ParseAnalyzer<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'ANALYZER'
      ? _AnalyzerBody<Trim<C>>
      : never
    : never
  : never;

type _AnalyzerBody<S extends string> =
  _ExtractNameAndModifiers<S> extends {
    name: infer AName extends string;
    rest: infer Rest extends string;
    overwrite: infer OW extends boolean;
    ifNotExists: infer INE extends boolean;
  }
    ? AnalyzerResult<
        AName,
        _ExtractFunction<Rest>,
        _ExtractTokenizers<Rest>,
        _ExtractFilters<Rest>,
        ExtractComment<Rest>,
        OW,
        INE
      >
    : never;

type _ExtractNameAndModifiers<S extends string> =
  Upper<FirstWord<S>> extends 'OVERWRITE'
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

type _ExtractFunction<S extends string> =
  Upper<S> extends `${string}FUNCTION ${string}` ? _FindAndExtractValue<S, 'FUNCTION'> : undefined;

type _ExtractTokenizers<S extends string> =
  Upper<S> extends `${string}TOKENIZERS ${string}` ? _FindAndExtractList<S, 'TOKENIZERS'> : [];

type _ExtractFilters<S extends string> =
  Upper<S> extends `${string}FILTERS ${string}` ? _FindAndExtractList<S, 'FILTERS'> : [];

/**
 * Find keyword and extract single value after it.
 */
type _FindAndExtractValue<S extends string, Keyword extends string> = Upper<
  // Check if keyword is at start
  FirstWord<S>
> extends Upper<Keyword>
  ? _ExtractSingleValue<AfterFirstWord<S>>
  : // Otherwise scan through string
    S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends Upper<Keyword>
      ? _ExtractSingleValue<After>
      : _FindAndExtractValue<`${Word} ${After}`, Keyword>
    : undefined;

/**
 * Find keyword and extract comma-separated list after it.
 */
type _FindAndExtractList<S extends string, Keyword extends string> = Upper<
  // Check if keyword is at start
  FirstWord<S>
> extends Upper<Keyword>
  ? _ParseList<_TrimToNextKeyword<AfterFirstWord<S>>>
  : // Otherwise scan through string
    S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends Upper<Keyword>
      ? _ParseList<_TrimToNextKeyword<After>>
      : _FindAndExtractList<`${Word} ${After}`, Keyword>
    : [];

/**
 * Extract single value (handles function calls with parens like fn::name or snowball(english)).
 */
type _ExtractSingleValue<S extends string> =
  Trim<S> extends `${infer Name}(${infer Args})${infer _Rest}`
    ? `${Name}(${Args})`
    : FirstWord<Trim<S>>;

/**
 * Trim to next major keyword.
 */
type _TrimToNextKeyword<S extends string> = S extends `${infer B} FUNCTION ${string}`
  ? Trim<B>
  : S extends `${infer B} Function ${string}`
    ? Trim<B>
    : S extends `${infer B} function ${string}`
      ? Trim<B>
      : S extends `${infer B} TOKENIZERS ${string}`
        ? Trim<B>
        : S extends `${infer B} Tokenizers ${string}`
          ? Trim<B>
          : S extends `${infer B} tokenizers ${string}`
            ? Trim<B>
            : S extends `${infer B} FILTERS ${string}`
              ? Trim<B>
              : S extends `${infer B} Filters ${string}`
                ? Trim<B>
                : S extends `${infer B} filters ${string}`
                  ? Trim<B>
                  : S extends `${infer B} COMMENT ${string}`
                    ? Trim<B>
                    : S extends `${infer B} Comment ${string}`
                      ? Trim<B>
                      : S extends `${infer B} comment ${string}`
                        ? Trim<B>
                        : Trim<S>;

/**
 * Parse comma-separated list.
 */
type _ParseList<S extends string> = Trim<S> extends '' ? [] : _SplitByComma<Trim<S>>;

/**
 * Split by comma, handling parentheses.
 */
type _SplitByComma<
  S extends string,
  Acc extends string[] = []
> = S extends `${infer Item},${infer Rest}`
  ? HasUnclosedParen<Item> extends true
    ? _HandleParenItem<S, Acc>
    : _SplitByComma<Trim<Rest>, [...Acc, Trim<Item>]>
  : Trim<S> extends ''
    ? Acc
    : [...Acc, Trim<S>];

/**
 * Handle item with unclosed parenthesis - find closing paren.
 */
type _HandleParenItem<
  S extends string,
  Acc extends string[]
> = S extends `${infer Before})${infer After}`
  ? After extends `,${infer Rest}`
    ? _SplitByComma<Trim<Rest>, [...Acc, Trim<`${Before})`>]>
    : After extends ''
      ? [...Acc, Trim<`${Before})`>]
      : [...Acc, Trim<`${Before})`>, ..._SplitByComma<Trim<After>>]
  : [...Acc, Trim<S>];

declare module '../registry' {
  interface StatementParsers<S extends string> {
    ANALYZER: ParseDefineAnalyzer<S>;
  }
}

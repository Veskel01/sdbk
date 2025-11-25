import type {
  AfterFirstWord,
  ExtractComment,
  FirstWord,
  ParseNumber,
  Trim,
  Upper
} from '../../utils';

/**
 * Result type for parsed DEFINE INDEX statements.
 *
 * @template Name - The index name
 * @template Table - The table the index is on
 * @template Fields - Array of indexed fields
 * @template Unique - Whether the index enforces uniqueness
 * @template IndexType - The type of index (unique, search, count, hnsw)
 * @template Overwrite - Whether OVERWRITE modifier is present
 * @template IfNotExists - Whether IF NOT EXISTS modifier is present
 * @template Analyzer - Analyzer name for FULLTEXT indexes
 * @template Comment - Optional comment
 * @template Concurrently - Whether CONCURRENTLY modifier is present
 * @template HnswConfig - HNSW configuration (dimension, type, dist, efc, m)
 */
export interface IndexResult<
  Name extends string = string,
  Table extends string = string,
  Fields extends string[] = string[],
  Unique extends boolean = false,
  IndexType extends 'unique' | 'search' | 'fulltext' | 'count' | 'hnsw' | undefined = undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false,
  Analyzer extends string | undefined = undefined,
  Comment extends string | undefined = undefined,
  Concurrently extends boolean = false,
  HnswConfig extends HnswConfigType | undefined = undefined
> {
  kind: 'index';
  name: Name;
  table: Table;
  fields: Fields;
  unique: Unique;
  indexType: IndexType;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
  analyzer: Analyzer;
  comment: Comment;
  concurrently: Concurrently;
  hnswConfig: HnswConfig;
}

/**
 * HNSW configuration type.
 */
export interface HnswConfigType {
  dimension: number | undefined;
  type: 'F64' | 'F32' | 'I64' | 'I32' | 'I16' | undefined;
  dist: 'EUCLIDEAN' | 'COSINE' | 'MANHATTAN' | 'MINKOWSKI' | undefined;
  efc: number | undefined;
  m: number | undefined;
}

export type ParseDefineIndex<S extends string> = _ParseIndex<Trim<S>>;

type _ParseIndex<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'INDEX'
      ? _ExtractModifiersAndName<Trim<C>>
      : never
    : never
  : never;

type _ExtractModifiersAndName<S extends string> = Upper<S> extends `OVERWRITE ${infer Rest}`
  ? _ExtractNameAfterModifiers<Rest, S, true, false>
  : Upper<S> extends `IF NOT EXISTS ${infer Rest}`
    ? _ExtractNameAfterModifiers<Rest, S, false, true>
    : _ExtractNameAfterModifiers<S, S, false, false>;

type _ExtractNameAfterModifiers<
  _Upper extends string,
  Original extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = Original extends `OVERWRITE ${infer Rest}`
  ? _IndexBody<Trim<Rest>, Overwrite, IfNotExists>
  : Original extends `IF NOT EXISTS ${infer Rest}`
    ? _IndexBody<Trim<Rest>, Overwrite, IfNotExists>
    : Original extends `overwrite ${infer Rest}`
      ? _IndexBody<Trim<Rest>, Overwrite, IfNotExists>
      : Original extends `if not exists ${infer Rest}`
        ? _IndexBody<Trim<Rest>, Overwrite, IfNotExists>
        : _IndexBody<Original, Overwrite, IfNotExists>;

type _IndexBody<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = FirstWord<S> extends infer IName extends string
  ? _AfterIndexName<AfterFirstWord<S>> extends {
      table: infer TName extends string;
      fields: infer Fields extends string[];
      opts: infer Opts extends string;
    }
    ? IndexResult<
        IName,
        TName,
        Fields,
        _HasUnique<Opts>,
        _IndexType<Opts>,
        Overwrite,
        IfNotExists,
        _ExtractAnalyzer<Opts>,
        ExtractComment<Opts>,
        _HasConcurrently<Opts>,
        _ExtractHnswConfig<Opts>
      >
    : never
  : never;

type _AfterIndexName<S extends string> = Upper<FirstWord<S>> extends 'ON'
  ? _ExtractTable<AfterFirstWord<S>>
  : never;

// Handle optional TABLE keyword: ON [ TABLE ] @table
type _ExtractTable<S extends string> = Upper<FirstWord<S>> extends 'TABLE'
  ? _ExtractIndexFields<AfterFirstWord<S>>
  : _ExtractIndexFields<S>;

type _ExtractIndexFields<S extends string> = FirstWord<S> extends infer Table extends string
  ? Upper<AfterFirstWord<S>> extends `FIELDS ${string}`
    ? _ExtractFieldsFromOriginal<Table, AfterFirstWord<S>, 'FIELDS'>
    : Upper<AfterFirstWord<S>> extends `COLUMNS ${string}`
      ? _ExtractFieldsFromOriginal<Table, AfterFirstWord<S>, 'COLUMNS'>
      : Upper<AfterFirstWord<S>> extends `COUNT${string}`
        ? { table: Table; fields: []; opts: AfterFirstWord<S> }
        : { table: Table; fields: []; opts: AfterFirstWord<S> }
  : never;

type _ExtractFieldsFromOriginal<
  Table extends string,
  S extends string,
  Keyword extends string
> = S extends `${Keyword} ${infer FieldsAndRest}`
  ? {
      table: Table;
      fields: _ParseFieldList<_ExtractFieldNames<FieldsAndRest>>;
      opts: _ExtractAfterFields<FieldsAndRest>;
    }
  : S extends `${Lowercase<Keyword>} ${infer FieldsAndRest}`
    ? {
        table: Table;
        fields: _ParseFieldList<_ExtractFieldNames<FieldsAndRest>>;
        opts: _ExtractAfterFields<FieldsAndRest>;
      }
    : { table: Table; fields: []; opts: S };

type _ExtractFieldNames<S extends string> = Upper<S> extends `${infer Fields} UNIQUE${string}`
  ? _TrimFieldNames<Fields, S>
  : Upper<S> extends `${infer Fields} FULLTEXT${string}`
    ? _TrimFieldNames<Fields, S>
    : Upper<S> extends `${infer Fields} SEARCH${string}`
      ? _TrimFieldNames<Fields, S>
      : Upper<S> extends `${infer Fields} COUNT${string}`
        ? _TrimFieldNames<Fields, S>
        : Upper<S> extends `${infer Fields} HNSW${string}`
          ? _TrimFieldNames<Fields, S>
          : Upper<S> extends `${infer Fields} COMMENT${string}`
            ? _TrimFieldNames<Fields, S>
            : Upper<S> extends `${infer Fields} CONCURRENTLY${string}`
              ? _TrimFieldNames<Fields, S>
              : S extends `${infer Fields};${string}`
                ? Trim<Fields>
                : Trim<S>;

type _TrimFieldNames<
  _UpperFields extends string,
  Original extends string
> = Original extends `${infer Before} UNIQUE${string}`
  ? Trim<Before>
  : Original extends `${infer Before} unique${string}`
    ? Trim<Before>
    : Original extends `${infer Before} FULLTEXT${string}`
      ? Trim<Before>
      : Original extends `${infer Before} fulltext${string}`
        ? Trim<Before>
        : Original extends `${infer Before} SEARCH${string}`
          ? Trim<Before>
          : Original extends `${infer Before} search${string}`
            ? Trim<Before>
            : Original extends `${infer Before} COUNT${string}`
              ? Trim<Before>
              : Original extends `${infer Before} count${string}`
                ? Trim<Before>
                : Original extends `${infer Before} HNSW${string}`
                  ? Trim<Before>
                  : Original extends `${infer Before} hnsw${string}`
                    ? Trim<Before>
                    : Original extends `${infer Before} COMMENT${string}`
                      ? Trim<Before>
                      : Original extends `${infer Before} comment${string}`
                        ? Trim<Before>
                        : Original extends `${infer Before} CONCURRENTLY${string}`
                          ? Trim<Before>
                          : Original extends `${infer Before} concurrently${string}`
                            ? Trim<Before>
                            : FirstWord<Original>;

type _ExtractAfterFields<S extends string> = _ExtractAfterFieldsImpl<S, Upper<S>>;

type _ExtractAfterFieldsImpl<
  Original extends string,
  U extends string
> = U extends `${string} UNIQUE${infer _Rest}`
  ? _GetAfterKeyword<Original, 'UNIQUE'>
  : U extends `${string} FULLTEXT${infer _Rest}`
    ? _GetAfterKeyword<Original, 'FULLTEXT'>
    : U extends `${string} SEARCH${infer _Rest}`
      ? _GetAfterKeyword<Original, 'SEARCH'>
      : U extends `${string} COUNT${infer _Rest}`
        ? _GetAfterKeyword<Original, 'COUNT'>
        : U extends `${string} HNSW${infer _Rest}`
          ? _GetAfterKeyword<Original, 'HNSW'>
          : U extends `${string} COMMENT${infer _Rest}`
            ? _GetAfterKeyword<Original, 'COMMENT'>
            : U extends `${string} CONCURRENTLY${infer _Rest}`
              ? _GetAfterKeyword<Original, 'CONCURRENTLY'>
              : '';

type _GetAfterKeyword<
  S extends string,
  Keyword extends string
> = S extends `${string} ${Keyword} ${infer Rest}`
  ? `${Keyword} ${Rest}`
  : S extends `${string} ${Lowercase<Keyword>} ${infer Rest}`
    ? `${Keyword} ${Rest}`
    : S extends `${string} ${Keyword}`
      ? Keyword
      : S extends `${string} ${Lowercase<Keyword>}`
        ? Keyword
        : '';

type _ParseFieldList<S extends string> = S extends `${infer F},${infer Rest}`
  ? [Trim<F>, ..._ParseFieldList<Trim<Rest>>]
  : S extends ''
    ? []
    : [Trim<S>];

type _IndexType<S extends string> = Upper<S> extends `${string}UNIQUE${string}`
  ? 'unique'
  : Upper<S> extends `${string}FULLTEXT${string}`
    ? 'fulltext'
    : Upper<S> extends `${string}SEARCH${string}`
      ? 'search'
      : Upper<S> extends `${string}COUNT${string}`
        ? 'count'
        : Upper<S> extends `${string}HNSW${string}`
          ? 'hnsw'
          : undefined;

type _HasUnique<S extends string> = Upper<S> extends `${string}UNIQUE${string}` ? true : false;

type _HasConcurrently<S extends string> = Upper<S> extends `${string}CONCURRENTLY${string}`
  ? true
  : false;

type _ExtractAnalyzer<S extends string> = S extends `${string}FULLTEXT ANALYZER ${infer Rest}`
  ? FirstWord<Rest>
  : S extends `${string}fulltext analyzer ${infer Rest}`
    ? FirstWord<Rest>
    : S extends `${string}Fulltext Analyzer ${infer Rest}`
      ? FirstWord<Rest>
      : S extends `${string}SEARCH ANALYZER ${infer Rest}`
        ? FirstWord<Rest>
        : S extends `${string}search analyzer ${infer Rest}`
          ? FirstWord<Rest>
          : undefined;

type _ExtractHnswConfig<S extends string> = Upper<S> extends `${string}HNSW ${infer Rest}`
  ? {
      dimension: _ExtractHnswDimension<Rest>;
      type: _ExtractHnswType<Rest>;
      dist: _ExtractHnswDist<Rest>;
      efc: _ExtractHnswEfc<Rest>;
      m: _ExtractHnswM<Rest>;
    }
  : undefined;

type _ExtractHnswDimension<S extends string> = Upper<S> extends `DIMENSION ${infer Rest}`
  ? ParseNumber<FirstWord<Rest>>
  : Upper<S> extends `${string} DIMENSION ${infer Rest}`
    ? ParseNumber<FirstWord<Rest>>
    : undefined;

type _ExtractHnswType<S extends string> = Upper<S> extends `${string}TYPE ${infer Rest}`
  ? Upper<FirstWord<Rest>> extends 'F64'
    ? 'F64'
    : Upper<FirstWord<Rest>> extends 'F32'
      ? 'F32'
      : Upper<FirstWord<Rest>> extends 'I64'
        ? 'I64'
        : Upper<FirstWord<Rest>> extends 'I32'
          ? 'I32'
          : Upper<FirstWord<Rest>> extends 'I16'
            ? 'I16'
            : undefined
  : undefined;

type _ExtractHnswDist<S extends string> = Upper<S> extends `${string}DIST ${infer Rest}`
  ? Upper<FirstWord<Rest>> extends 'EUCLIDEAN'
    ? 'EUCLIDEAN'
    : Upper<FirstWord<Rest>> extends 'COSINE'
      ? 'COSINE'
      : Upper<FirstWord<Rest>> extends 'MANHATTAN'
        ? 'MANHATTAN'
        : Upper<FirstWord<Rest>> extends 'MINKOWSKI'
          ? 'MINKOWSKI'
          : undefined
  : undefined;

type _ExtractHnswEfc<S extends string> = Upper<S> extends `${string}EFC ${infer Rest}`
  ? ParseNumber<FirstWord<Rest>>
  : undefined;

type _ExtractHnswM<S extends string> = Upper<S> extends `${string} M ${infer Rest}`
  ? ParseNumber<FirstWord<Rest>>
  : undefined;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    INDEX: ParseDefineIndex<S>;
  }
}

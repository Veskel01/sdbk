import type {
  AfterFirstWord,
  ExtractComment,
  FirstWord,
  ParseQuotedString,
  Trim,
  Upper
} from '../../utils';

/**
 * Result of parsing a DEFINE BUCKET statement.
 * @see https://surrealdb.com/docs/surrealql/statements/define/bucket
 */
export interface BucketResult<
  Name extends string = string,
  Backend extends string | undefined = string | undefined,
  Permissions extends string | undefined = string | undefined,
  Comment extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'bucket';
  name: Name;
  backend: Backend;
  permissions: Permissions;
  comment: Comment;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineBucket<S extends string> = _ParseBucket<Trim<S>>;

type _ParseBucket<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'BUCKET'
      ? _BucketBody<Trim<C>>
      : never
    : never
  : never;

type _BucketBody<S extends string> = _ExtractNameAndModifiers<S> extends {
  name: infer BName extends string;
  rest: infer Rest extends string;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? BucketResult<
      BName,
      _ExtractBackend<Rest>,
      _ExtractPermissions<Rest>,
      ExtractComment<Rest>,
      OW,
      INE
    >
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

type _ExtractBackend<S extends string> = Upper<S> extends `${string}BACKEND ${string}`
  ? _FindAndExtractQuoted<S, 'BACKEND'>
  : undefined;

type _ExtractPermissions<S extends string> = Upper<S> extends `${string}PERMISSIONS ${string}`
  ? _FindAndExtractPermissions<S>
  : undefined;

type _FindAndExtractPermissions<S extends string> = Upper<FirstWord<S>> extends 'PERMISSIONS'
  ? _ExtractPermissionsValue<AfterFirstWord<S>>
  : S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends 'PERMISSIONS'
      ? _ExtractPermissionsValue<After>
      : _FindAndExtractPermissions<`${Word} ${After}`>
    : undefined;

type _ExtractPermissionsValue<S extends string> = Trim<S> extends `WHERE ${infer Expr}`
  ? _TrimPermissionsToComment<`WHERE ${Expr}`>
  : Trim<S> extends `FULL${infer _Rest}`
    ? 'FULL'
    : Trim<S> extends `NONE${infer _Rest}`
      ? 'NONE'
      : _TrimPermissionsToComment<FirstWord<Trim<S>>>;

type _TrimPermissionsToComment<S extends string> = S extends `${infer B} COMMENT ${string}`
  ? Trim<B>
  : S extends `${infer B} Comment ${string}`
    ? Trim<B>
    : S extends `${infer B} comment ${string}`
      ? Trim<B>
      : Trim<S>;

type _FindAndExtractQuoted<S extends string, Keyword extends string> = Upper<
  FirstWord<S>
> extends Upper<Keyword>
  ? ParseQuotedString<AfterFirstWord<S>>
  : S extends `${infer _Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends Upper<Keyword>
      ? ParseQuotedString<After>
      : _FindAndExtractQuoted<`${Word} ${After}`, Keyword>
    : undefined;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    BUCKET: ParseDefineBucket<S>;
  }
}

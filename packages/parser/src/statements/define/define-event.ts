import type {
  AfterFirstWord,
  ExtractComment,
  ExtractNameAndModifiers,
  FirstWord,
  Trim,
  Upper
} from '../../utils';

/**
 * Result of parsing a DEFINE EVENT statement.
 * @see https://surrealdb.com/docs/surrealql/statements/define/event
 */
export interface EventResult<
  Name extends string = string,
  Table extends string = string,
  When extends string | undefined = string | undefined,
  Then extends string | undefined = string | undefined,
  Comment extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'event';
  name: Name;
  table: Table;
  when: When;
  then: Then;
  comment: Comment;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineEvent<S extends string> = _ParseEvent<Trim<S>>;

type _ParseEvent<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'EVENT'
      ? _EventBody<Trim<C>>
      : never
    : never
  : never;

type _EventBody<S extends string> = ExtractNameAndModifiers<S> extends {
  name: infer EName extends string;
  rest: infer Rest extends string;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? _ExtractTable<Rest> extends {
      table: infer TName extends string;
      rest: infer Rest2 extends string;
    }
    ? EventResult<
        EName,
        TName,
        _ExtractWhen<Rest2>,
        _ExtractThen<Rest2>,
        ExtractComment<Rest2>,
        OW,
        INE
      >
    : never
  : never;

type _ExtractTable<S extends string> = Upper<FirstWord<S>> extends 'ON'
  ? _ExtractTableName<AfterFirstWord<S>>
  : never;

type _ExtractTableName<S extends string> = Upper<FirstWord<S>> extends 'TABLE'
  ? { table: FirstWord<AfterFirstWord<S>>; rest: AfterFirstWord<AfterFirstWord<S>> }
  : { table: FirstWord<S>; rest: AfterFirstWord<S> };

type _ExtractWhen<S extends string> = Upper<S> extends `${string}WHEN ${string}`
  ? _FindWhenClause<S>
  : undefined;

type _FindWhenClause<S extends string> = S extends `${string}WHEN ${infer Rest}`
  ? _ExtractWhenExpr<Rest>
  : S extends `${string}when ${infer Rest}`
    ? _ExtractWhenExpr<Rest>
    : S extends `${string}When ${infer Rest}`
      ? _ExtractWhenExpr<Rest>
      : undefined;

type _ExtractWhenExpr<S extends string> = S extends `${infer Expr} THEN${string}`
  ? Trim<Expr>
  : S extends `${infer Expr} then${string}`
    ? Trim<Expr>
    : S extends `${infer Expr} Then${string}`
      ? Trim<Expr>
      : Trim<S>;

type _ExtractThen<S extends string> = Upper<S> extends `${string}THEN ${string}`
  ? _FindThenClause<S>
  : Upper<S> extends `${string}THEN{${string}`
    ? _FindThenClause<S>
    : Upper<S> extends `${string}THEN(${string}`
      ? _FindThenClause<S>
      : undefined;

type _FindThenClause<S extends string> = S extends `${string}THEN ${infer Rest}`
  ? _TrimThenToComment<Trim<Rest>>
  : S extends `${string}then ${infer Rest}`
    ? _TrimThenToComment<Trim<Rest>>
    : S extends `${string}Then ${infer Rest}`
      ? _TrimThenToComment<Trim<Rest>>
      : S extends `${string}THEN${infer Rest}`
        ? _TrimThenToComment<Trim<Rest>>
        : S extends `${string}then${infer Rest}`
          ? _TrimThenToComment<Trim<Rest>>
          : S extends `${string}Then${infer Rest}`
            ? _TrimThenToComment<Trim<Rest>>
            : undefined;

type _TrimThenToComment<S extends string> = S extends `${infer B} COMMENT ${string}`
  ? Trim<B>
  : S extends `${infer B} Comment ${string}`
    ? Trim<B>
    : S extends `${infer B} comment ${string}`
      ? Trim<B>
      : Trim<S>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    EVENT: ParseDefineEvent<S>;
  }
}

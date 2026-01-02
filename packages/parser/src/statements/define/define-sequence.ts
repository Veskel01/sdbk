import type {
  ExtractDuration,
  FirstWord,
  HasIfNotExists,
  HasOverwrite,
  ParseNumber,
  SkipIfNotExists,
  SkipOverwrite,
  Trim,
  Upper
} from '../../utils';

/**
 * Result type for parsed DEFINE SEQUENCE statements.
 *
 * @template Name - The sequence name
 * @template Batch - The batch size for allocation
 * @template Start - The starting value
 * @template Timeout - The timeout duration
 * @template Overwrite - Whether OVERWRITE modifier is present
 * @template IfNotExists - Whether IF NOT EXISTS modifier is present
 */
export interface SequenceResult<
  Name extends string = string,
  Batch extends number | undefined = number | undefined,
  Start extends number | undefined = number | undefined,
  Timeout extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'sequence';
  name: Name;
  batch: Batch;
  start: Start;
  timeout: Timeout;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineSequence<S extends string> = _ParseSequence<Trim<S>>;

type _ParseSequence<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'SEQUENCE'
      ? _ExtractModifiersAndName<Trim<C>>
      : never
    : never
  : never;

type _ExtractModifiersAndName<S extends string> =
  HasOverwrite<S> extends true
    ? _SequenceBody<SkipOverwrite<S>, true, false>
    : HasIfNotExists<S> extends true
      ? _SequenceBody<SkipIfNotExists<S>, false, true>
      : _SequenceBody<S, false, false>;

type _SequenceBody<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = SequenceResult<
  FirstWord<S>,
  _ExtractBatch<S>,
  _ExtractStart<S>,
  _ExtractTimeout<S>,
  Overwrite,
  IfNotExists
>;

// Extract BATCH clause
type _ExtractBatch<S extends string> =
  Upper<S> extends `${string}BATCH ${infer Rest}` ? ParseNumber<FirstWord<Rest>> : undefined;

// Extract START clause
type _ExtractStart<S extends string> =
  Upper<S> extends `${string}START ${infer Rest}` ? ParseNumber<FirstWord<Rest>> : undefined;

// Extract TIMEOUT clause (preserving original casing for duration)
type _ExtractTimeout<S extends string> = S extends `${string}TIMEOUT ${infer Rest}`
  ? ExtractDuration<Trim<Rest>>
  : S extends `${string}timeout ${infer Rest}`
    ? ExtractDuration<Trim<Rest>>
    : undefined;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    SEQUENCE: ParseDefineSequence<S>;
  }
}

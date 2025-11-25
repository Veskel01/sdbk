import type { Add, Inc, Sub } from './math';
import type { Trim, Upper } from './string';

/**
 * Extract expression until next keyword, preserving original case.
 * Handles parentheses - keywords inside parentheses are ignored.
 *
 * @example
 * ```typescript
 * type Result = ExtractExprUntilKeyword<'$value + 1 ASSERT $value > 0'>; // '$value + 1'
 * type Result2 = ExtractExprUntilKeyword<'math::sum((SELECT VALUE x FROM t)) COMMENT "test"'>;
 * // => 'math::sum((SELECT VALUE x FROM t))'
 * ```
 */
export type ExtractExprUntilKeyword<S extends string> = _ScanWithDepth<Trim<S>, '', 0>;

/**
 * Keywords that terminate field expressions.
 */
type IsFieldKeyword<W extends string> = Upper<W> extends
  | 'ASSERT'
  | 'READONLY'
  | 'FLEXIBLE'
  | 'REFERENCE'
  | 'DEFAULT'
  | 'VALUE'
  | 'COMPUTED'
  | 'TYPE'
  | 'PERMISSIONS'
  | 'COMMENT'
  ? true
  : false;

/**
 * Count opening parentheses in a word.
 */
type CountOpen<S extends string, N extends number = 0> = S extends `${string}(${infer Rest}`
  ? CountOpen<Rest, Inc<N>>
  : N;

/**
 * Count closing parentheses in a word.
 */
type CountClose<S extends string, N extends number = 0> = S extends `${string})${infer Rest}`
  ? CountClose<Rest, Inc<N>>
  : N;

/**
 * Compute new depth after processing a word.
 */
type UpdateDepth<Depth extends number, Word extends string> = Sub<
  Add<Depth, CountOpen<Word>>,
  CountClose<Word>
>;

/**
 * Scan with parenthesis depth tracking.
 * Only stop on keywords when depth is 0.
 */
type _ScanWithDepth<
  S extends string,
  Acc extends string,
  Depth extends number
> = S extends `${infer Word} ${infer Rest}`
  ? Depth extends 0
    ? IsFieldKeyword<Word> extends true
      ? Trim<Acc>
      : _ScanWithDepth<Rest, Acc extends '' ? Word : `${Acc} ${Word}`, UpdateDepth<Depth, Word>>
    : _ScanWithDepth<Rest, Acc extends '' ? Word : `${Acc} ${Word}`, UpdateDepth<Depth, Word>>
  : Trim<Acc extends '' ? S : `${Acc} ${S}`>;

/**
 * Extract content until next keyword (COMMENT, PERMISSIONS) or end.
 * Used in Param values.
 *
 * @example
 * ```typescript
 * type Result = ExtractUntilKeyword<'"value" COMMENT "test"'>; // 'value'
 * ```
 */
export type ExtractUntilKeyword<S extends string> = _ScanUntilParamKeyword<Trim<S>, ''>;

type IsParamKeyword<W extends string> = Upper<W> extends 'COMMENT' | 'PERMISSIONS' ? true : false;

type _ScanUntilParamKeyword<
  S extends string,
  Acc extends string
> = S extends `${infer Word} ${infer Rest}`
  ? IsParamKeyword<Word> extends true
    ? StripQuotes<Trim<Acc>>
    : _ScanUntilParamKeyword<Rest, Acc extends '' ? Word : `${Acc} ${Word}`>
  : StripQuotes<Trim<Acc extends '' ? S : `${Acc} ${S}`>>;

/**
 * Strip surrounding quotes from string literals.
 *
 * @example
 * ```typescript
 * type Result = StripQuotes<'"hello"'>; // 'hello'
 * type Result2 = StripQuotes<"'world'">; // 'world'
 * ```
 */
export type StripQuotes<S extends string> = S extends `"${infer Inner}"`
  ? UnescapeString<Inner>
  : S extends `'${infer Inner}'`
    ? UnescapeString<Inner>
    : S;

/**
 * Unescape common escape sequences in strings.
 */
export type UnescapeString<S extends string> = S extends `${infer Before}\\${infer After}`
  ? After extends `"${infer Rest}`
    ? `${Before}"${UnescapeString<Rest>}`
    : After extends `'${infer Rest}`
      ? `${Before}'${UnescapeString<Rest>}`
      : After extends `\\${infer Rest}`
        ? `${Before}\\${UnescapeString<Rest>}`
        : `${Before}\\${UnescapeString<After>}`
  : S;

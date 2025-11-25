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
  ? CountOpen<Rest, _Inc<N>>
  : N;

/**
 * Count closing parentheses in a word.
 */
type CountClose<S extends string, N extends number = 0> = S extends `${string})${infer Rest}`
  ? CountClose<Rest, _Inc<N>>
  : N;

type _Inc<N extends number> = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20
][N];

/**
 * Compute new depth after processing a word.
 */
type UpdateDepth<Depth extends number, Word extends string> = _AddSub<
  Depth,
  CountOpen<Word>,
  CountClose<Word>
>;

type _AddSub<D extends number, Add extends number, Sub extends number> = _Sub<_Add<D, Add>, Sub>;

type _Add<A extends number, B extends number> = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
][A][B];

type _Sub<A extends number, B extends number> = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  [7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  [8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3],
  [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4],
  [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5],
  [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6],
  [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7],
  [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8],
  [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10]
][A][B];

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

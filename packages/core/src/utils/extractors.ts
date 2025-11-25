import type { Trim, Upper } from './string';

/**
 * Extract expression until next keyword, preserving original case.
 * Used in Field and Param definitions.
 *
 * Scans word by word and stops when finding a keyword (case-insensitive).
 *
 * @example
 * ```typescript
 * type Result = ExtractExprUntilKeyword<'$value + 1 ASSERT $value > 0'>; // '$value + 1'
 * ```
 */
export type ExtractExprUntilKeyword<S extends string> = _ScanForKeyword<Trim<S>, ''>;

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
 * Scan string word by word, accumulating until a keyword is found.
 */
type _ScanForKeyword<S extends string, Acc extends string> = S extends `${infer Word} ${infer Rest}`
  ? IsFieldKeyword<Word> extends true
    ? Trim<Acc>
    : _ScanForKeyword<Rest, Acc extends '' ? Word : `${Acc} ${Word}`>
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

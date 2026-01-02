import type { AfterFirstWord, FirstWord, Trim, Upper } from './string';

/** Result produced by {@link ExtractNameAndModifiers}. */
export interface NameAndModifiers<
  Name extends string = string,
  Rest extends string = string,
  Overwrite extends boolean = boolean,
  IfNotExists extends boolean = boolean
> {
  name: Name;
  rest: Rest;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

/**
 * Extracts the logical name and leading modifiers (`OVERWRITE`, `IF NOT EXISTS`) from a DEFINE body.
 *
 * @remarks
 * Centralises the common \"strip modifiers, then read the name\" pattern used by most
 * `DEFINE *` parsers so that edge‑case handling (spacing, casing) lives in one place.
 */
export type ExtractNameAndModifiers<S extends string> =
  Upper<FirstWord<S>> extends 'OVERWRITE'
    ? NameAndModifiers<FirstWord<AfterFirstWord<S>>, AfterFirstWord<AfterFirstWord<S>>, true, false>
    : Upper<S> extends `IF NOT EXISTS ${string}`
      ? ExtractAfterIfNotExists<S>
      : NameAndModifiers<FirstWord<S>, AfterFirstWord<S>, false, false>;

/** Helper for {@link ExtractNameAndModifiers} to handle the `IF NOT EXISTS` form. */
export type ExtractAfterIfNotExists<S extends string> =
  S extends `${string} ${string} ${string} ${infer Rest}`
    ? NameAndModifiers<FirstWord<Trim<Rest>>, AfterFirstWord<Trim<Rest>>, false, true>
    : never;

/**
 * Skip OVERWRITE modifier and return the rest of the string.
 *
 * @example
 * ```typescript
 * type Result = SkipOverwrite<'OVERWRITE myTable'>; // 'myTable'
 * ```
 */
export type SkipOverwrite<S extends string> = S extends `OVERWRITE ${infer Rest}`
  ? Trim<Rest>
  : S extends `overwrite ${infer Rest}`
    ? Trim<Rest>
    : S extends `Overwrite ${infer Rest}`
      ? Trim<Rest>
      : S;

/**
 * Skip IF NOT EXISTS modifier and return the rest of the string.
 *
 * @example
 * ```typescript
 * type Result = SkipIfNotExists<'IF NOT EXISTS myTable'>; // 'myTable'
 * ```
 */
export type SkipIfNotExists<S extends string> = S extends `IF NOT EXISTS ${infer Rest}`
  ? Trim<Rest>
  : S extends `if not exists ${infer Rest}`
    ? Trim<Rest>
    : S extends `If Not Exists ${infer Rest}`
      ? Trim<Rest>
      : S;

/**
 * Check if string starts with OVERWRITE modifier (case-insensitive).
 */
export type HasOverwrite<S extends string> =
  Uppercase<S> extends `OVERWRITE ${string}` ? true : false;

/**
 * Check if string starts with IF NOT EXISTS modifier (case-insensitive).
 */
export type HasIfNotExists<S extends string> =
  Uppercase<S> extends `IF NOT EXISTS ${string}` ? true : false;

// =============================================================================
// COMMENT EXTRACTION
// =============================================================================

/**
 * Extract COMMENT clause value from a string.
 * Handles both single and double quotes, with or without trailing content.
 * Preserves original casing of the comment content.
 *
 * @example
 * ```typescript
 * type Result = ExtractComment<'... COMMENT "My comment"'>; // 'My comment'
 * ```
 */
export type ExtractComment<S extends string> = S extends `${string}COMMENT "${infer C}"${string}`
  ? C
  : S extends `${string}comment "${infer C}"${string}`
    ? C
    : S extends `${string}Comment "${infer C}"${string}`
      ? C
      : S extends `${string}COMMENT '${infer C}'${string}`
        ? C
        : S extends `${string}comment '${infer C}'${string}`
          ? C
          : S extends `${string}Comment '${infer C}'${string}`
            ? C
            : S extends `${string}COMMENT "${infer C}"`
              ? C
              : S extends `${string}comment "${infer C}"`
                ? C
                : S extends `${string}Comment "${infer C}"`
                  ? C
                  : S extends `${string}COMMENT '${infer C}'`
                    ? C
                    : S extends `${string}comment '${infer C}'`
                      ? C
                      : S extends `${string}Comment '${infer C}'`
                        ? C
                        : undefined;

/**
 * Parse a quoted string value.
 * Handles double quotes, single quotes, and file pointers (f"...").
 *
 * @example
 * ```typescript
 * type Result = ParseQuotedString<'"hello"'>; // 'hello'
 * type Result2 = ParseQuotedString<"f'path/to/file'">; // 'path/to/file'
 * ```
 */
export type ParseQuotedString<S extends string> = S extends `"${infer Content}"${string}`
  ? Content
  : S extends `'${infer Content}'${string}`
    ? Content
    : S extends `"${infer Content}"`
      ? Content
      : S extends `'${infer Content}'`
        ? Content
        : S extends `f"${infer Content}"`
          ? Content
          : S extends `f'${infer Content}'`
            ? Content
            : FirstWord<S>;

/**
 * Extract a duration value from a string.
 * Stops at space or comma.
 *
 * @example
 * ```typescript
 * type Result = ExtractDuration<'1h, FOR SESSION'>; // '1h'
 * type Result2 = ExtractDuration<'30m COMMENT'>; // '30m'
 * ```
 */
export type ExtractDuration<S extends string> = S extends `${infer D},${string}`
  ? Trim<D>
  : S extends `${infer D} ${string}`
    ? Trim<D>
    : Trim<S>;

/**
 * Check if string has PERMISSIONS NONE.
 */
export type HasPermissionsNone<S extends string> =
  Uppercase<S> extends `${string}PERMISSIONS NONE${string}` ? true : false;

/**
 * Check if string has PERMISSIONS FULL.
 */
export type HasPermissionsFull<S extends string> =
  Uppercase<S> extends `${string}PERMISSIONS FULL${string}` ? true : false;

/**
 * Extract simple permissions (NONE, FULL, or WHERE condition).
 *
 * @example
 * ```typescript
 * type Result = ExtractSimplePermissions<'... PERMISSIONS NONE'>; // 'none'
 * type Result2 = ExtractSimplePermissions<'... PERMISSIONS WHERE $auth'>; // '$auth'
 * ```
 */
export type ExtractSimplePermissions<S extends string> =
  HasPermissionsNone<S> extends true
    ? 'none'
    : HasPermissionsFull<S> extends true
      ? 'full'
      : S extends `${string}PERMISSIONS WHERE ${infer Cond}`
        ? _TrimPermissionCondition<Cond>
        : S extends `${string}permissions where ${infer Cond}`
          ? _TrimPermissionCondition<Cond>
          : undefined;

type _TrimPermissionCondition<S extends string> = S extends `${infer C} COMMENT ${string}`
  ? Trim<C>
  : S extends `${infer C} comment ${string}`
    ? Trim<C>
    : Trim<S>;

/**
 * Check if a word is a common statement keyword (case-insensitive).
 */
export type IsCommonKeyword<W extends string> =
  Uppercase<W> extends 'COMMENT' | 'PERMISSIONS' | 'DURATION' | 'CONCURRENTLY' ? true : false;

/**
 * Extract value until a common keyword is found.
 * Preserves original casing.
 *
 * @example
 * ```typescript
 * type Result = ExtractValueUntilKeyword<'some value COMMENT "test"'>; // 'some value'
 * ```
 */
export type ExtractValueUntilKeyword<
  S extends string,
  Keywords extends string = 'COMMENT' | 'PERMISSIONS' | 'DURATION'
> = _ScanValueUntilKeyword<Trim<S>, '', Keywords>;

type _ScanValueUntilKeyword<
  S extends string,
  Acc extends string,
  Keywords extends string
> = S extends `${infer Word} ${infer Rest}`
  ? Uppercase<Word> extends Uppercase<Keywords>
    ? Trim<Acc>
    : _ScanValueUntilKeyword<Rest, Acc extends '' ? Word : `${Acc} ${Word}`, Keywords>
  : Trim<Acc extends '' ? S : `${Acc} ${S}`>;

/**
 * Check if string has unclosed parenthesis.
 * Used for parsing comma-separated lists where items may contain parentheses.
 *
 * @example
 * ```typescript
 * type Result = HasUnclosedParen<'foo(bar'>; // true
 * type Result2 = HasUnclosedParen<'foo(bar)'>; // false
 * ```
 */
export type HasUnclosedParen<S extends string> = S extends `${string}(${infer After}`
  ? After extends `${string})${string}`
    ? false
    : true
  : false;

/**
 * Trims whitespace from both ends of a string type.
 *
 * @example
 * ```typescript
 * type Result = Trim<'  hello  '>; // 'hello'
 * type Result2 = Trim<'\n test \t'>; // 'test'
 * ```
 */
export type Trim<T extends string> = T extends ` ${infer R}`
  ? Trim<R>
  : T extends `${infer R} `
    ? Trim<R>
    : T extends `\n${infer R}`
      ? Trim<R>
      : T extends `${infer R}\n`
        ? Trim<R>
        : T extends `\t${infer R}`
          ? Trim<R>
          : T extends `${infer R}\t`
            ? Trim<R>
            : T extends `\r${infer R}`
              ? Trim<R>
              : T extends `${infer R}\r`
                ? Trim<R>
                : T;

/**
 * Converts string to uppercase for case-insensitive matching.
 *
 * @example
 * ```typescript
 * type Result = Upper<'hello'>; // 'HELLO'
 * ```
 */
export type Upper<S extends string> = Uppercase<S>;

/**
 * Extracts first word from a string (stops at space or end).
 *
 * @example
 * ```typescript
 * type Result = FirstWord<'hello world'>; // 'hello'
 * type Result2 = FirstWord<'single'>; // 'single'
 * ```
 */
export type FirstWord<S extends string> = S extends `${infer Word} ${string}`
  ? Word
  : S extends `${infer Word}\n${string}`
    ? Word
    : S extends `${infer Word}\t${string}`
      ? Word
      : S;

/**
 * Extracts rest after first word.
 *
 * @example
 * ```typescript
 * type Result = AfterFirstWord<'hello world test'>; // 'world test'
 * type Result2 = AfterFirstWord<'single'>; // ''
 * ```
 */
export type AfterFirstWord<S extends string> = S extends `${string} ${infer Rest}`
  ? Trim<Rest>
  : S extends `${string}\n${infer Rest}`
    ? Trim<Rest>
    : S extends `${string}\t${infer Rest}`
      ? Trim<Rest>
      : '';

/**
 * Normalizes whitespace by collapsing multiple consecutive spaces/tabs/newlines into single space.
 * Also normalizes tabs and newlines to spaces.
 * Processes recursively until no more whitespace normalization is needed.
 *
 * @example
 * ```typescript
 * type Result = NormalizeWhitespace<'hello   world'>; // 'hello world'
 * type Result2 = NormalizeWhitespace<'hello\t\tworld'>; // 'hello world'
 * type Result3 = NormalizeWhitespace<'hello\n\nworld'>; // 'hello world'
 * ```
 */
export type NormalizeWhitespace<S extends string> = S extends `${infer Before}  ${infer After}`
  ? NormalizeWhitespace<`${Before} ${After}`>
  : S extends `${infer Before}\t${infer After}`
    ? NormalizeWhitespace<`${Before} ${After}`>
    : S extends `${infer Before}\r\n${infer After}`
      ? NormalizeWhitespace<`${Before} ${After}`>
      : S extends `${infer Before}\n\r${infer After}`
        ? NormalizeWhitespace<`${Before} ${After}`>
        : S extends `${infer Before}\n${infer After}`
          ? NormalizeWhitespace<`${Before} ${After}`>
          : S extends `${infer Before}\r${infer After}`
            ? NormalizeWhitespace<`${Before} ${After}`>
            : S;

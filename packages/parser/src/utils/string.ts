/** Trims all leading and trailing whitespace characters from a string literal type. */
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

/** Uppercases a string literal for case‑insensitive matching. */
export type Upper<S extends string> = Uppercase<S>;

/** Extracts the first whitespace‑separated token from a string literal. */
export type FirstWord<S extends string> = S extends `${infer Word} ${string}`
  ? Word
  : S extends `${infer Word}\n${string}`
    ? Word
    : S extends `${infer Word}\t${string}`
      ? Word
      : S;

/** Returns the substring after the first whitespace‑separated token. */
export type AfterFirstWord<S extends string> = S extends `${string} ${infer Rest}`
  ? Trim<Rest>
  : S extends `${string}\n${infer Rest}`
    ? Trim<Rest>
    : S extends `${string}\t${infer Rest}`
      ? Trim<Rest>
      : '';

/** Collapses runs of whitespace into single spaces and normalizes all whitespace to spaces. */
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

import type { ParserState, State } from './state';

/**
 * Fast path for simple statements (no braces).
 * Scans until ; and returns [statement, remaining] or null if not applicable.
 *
 * IMPORTANT: We must check for braces BEFORE extracting, because template literal
 * matching is greedy and will match the FIRST semicolon, which could be inside
 * a function body like `{ RETURN x; }`.
 */
export type FastScanSimple<Input extends string> =
  // First check: if input contains `{`, don't use fast path at all
  Input extends `${string}{${string}`
    ? null // Has braces somewhere, use slow path for entire input
    : Input extends `${infer Stmt};${infer Rest}`
      ? [Stmt, Rest]
      : null;

/** Delimiter characters that mark statement boundaries */
type Delim = '{' | '}' | ';';

/** Result of scanning: [before_delimiter, from_delimiter_onwards] */
type ScanResult = [before: string, rest: string];

/** If R is a valid result, return it; otherwise recurse with accumulated chars */
type Continue<
  R,
  Rest extends string,
  Chunk extends string,
  Acc extends string
> = R extends ScanResult ? R : ScanChunk<Rest, `${Acc}${Chunk}`>;

/** Check single char position for delimiter */
type At<C extends string, Before extends string, After extends string> = C extends Delim
  ? [Before, `${C}${After}`]
  : null;

/** Find first delimiter in 4 characters */
type In4<C extends [string, string, string, string], Acc extends string, Tail extends string> = At<
  C[0],
  Acc,
  `${C[1]}${C[2]}${C[3]}${Tail}`
> extends infer R
  ? R extends null
    ? At<C[1], `${Acc}${C[0]}`, `${C[2]}${C[3]}${Tail}`> extends infer R1
      ? R1 extends null
        ? At<C[2], `${Acc}${C[0]}${C[1]}`, `${C[3]}${Tail}`> extends infer R2
          ? R2 extends null
            ? At<C[3], `${Acc}${C[0]}${C[1]}${C[2]}`, Tail>
            : R2
          : never
        : R1
      : never
    : R
  : never;

/** Find first delimiter in 8 characters (delegates to In4) */
type In8<
  C extends [string, string, string, string, string, string, string, string],
  Acc extends string,
  Tail extends string
> = In4<[C[0], C[1], C[2], C[3]], Acc, `${C[4]}${C[5]}${C[6]}${C[7]}${Tail}`> extends infer R
  ? R extends null
    ? In4<[C[4], C[5], C[6], C[7]], `${Acc}${C[0]}${C[1]}${C[2]}${C[3]}`, Tail>
    : R
  : never;

/** Concatenate 4 chars */
type J4<C extends [string, string, string, string]> = `${C[0]}${C[1]}${C[2]}${C[3]}`;

/** Concatenate 8 chars */
type J8<C extends [string, string, string, string, string, string, string, string]> =
  `${C[0]}${C[1]}${C[2]}${C[3]}${C[4]}${C[5]}${C[6]}${C[7]}`;

/**
 * Scan input for delimiter, processing up to 16 chars per iteration.
 * Returns [chars_before_delimiter, from_delimiter_onwards]
 */
type ScanChunk<Input extends string, Acc extends string = ''> = Input extends `${
  infer A // 16 chars
}${infer B}${infer C}${infer D}${infer E}${infer F}${infer G}${infer H}${infer I}${infer J}${infer K}${infer L}${infer M}${infer N}${infer O}${infer P}${infer Rest}`
  ? In8<[A, B, C, D, E, F, G, H], Acc, `${I}${J}${K}${L}${M}${N}${O}${P}${Rest}`> extends infer R
    ? R extends null
      ? Continue<
          In8<[I, J, K, L, M, N, O, P], `${Acc}${A}${B}${C}${D}${E}${F}${G}${H}`, Rest>,
          Rest,
          `${A}${B}${C}${D}${E}${F}${G}${H}${I}${J}${K}${L}${M}${N}${O}${P}`,
          Acc
        >
      : R
    : never
  : // 8 chars
    Input extends `${infer A}${infer B}${infer C}${infer D}${infer E}${infer F}${infer G}${infer H}${infer Rest}`
    ? Continue<In8<[A, B, C, D, E, F, G, H], Acc, Rest>, Rest, J8<[A, B, C, D, E, F, G, H]>, Acc>
    : // 4 chars
      Input extends `${infer A}${infer B}${infer C}${infer D}${infer Rest}`
      ? Continue<In4<[A, B, C, D], Acc, Rest>, Rest, J4<[A, B, C, D]>, Acc>
      : // 1 char
        Input extends `${infer C}${infer Rest}`
        ? C extends Delim
          ? [Acc, Input]
          : ScanChunk<Rest, `${Acc}${C}`>
        : [Acc, ''];

/**
 * Scan a single statement with brace depth tracking.
 * Optimized with chunking for sequences without special characters.
 *
 * Note: When closing brace brings depth to 0, we continue scanning
 * until we hit a semicolon to capture trailing clauses like PERMISSIONS.
 */
export type ScanStatement<S extends ParserState> = _ScanStatementImpl<S>;

type _ScanStatementImpl<S extends ParserState> = S['input'] extends ''
  ? S
  : S['input'] extends `{${infer Rest}`
    ? _ScanStatementImpl<State.OpenBrace<S, Rest>>
    : S['input'] extends `}${infer Rest}`
      ? _HandleCloseBrace<S, Rest>
      : S['input'] extends `;${infer Rest}`
        ? _HandleSemicolon<S, Rest>
        : _HandleChunk<S>;

type _HandleCloseBrace<S extends ParserState, Rest extends string> = S['depth'] extends 1
  ? Rest extends `;${string}`
    ? State.CloseBraceAndFinish<S, Rest>
    : _ScanStatementImpl<State.CloseBrace<S, Rest>>
  : S['depth'] extends 0
    ? _ScanStatementImpl<State.AddChar<S, '}', Rest>>
    : _ScanStatementImpl<State.CloseBrace<S, Rest>>;

type _HandleSemicolon<S extends ParserState, Rest extends string> = S['depth'] extends 0
  ? State.FinishStatement<S, Rest>
  : _ScanStatementImpl<State.AddSemicolon<S, Rest>>;

type _HandleChunk<S extends ParserState> = ScanChunk<S['input']> extends [
  infer Chunk extends string,
  infer Remaining extends string
]
  ? Chunk extends ''
    ? S
    : _ScanStatementImpl<{
        input: Remaining;
        scanned: `${S['scanned']}${Chunk}`;
        statements: S['statements'];
        depth: S['depth'];
        current: `${S['current']}${Chunk}`;
      }>
  : S;

/**
 * Scan the next statement.
 *
 * Strategy:
 * 1. If input has braces, use ScanStatement (handles depth tracking)
 * 2. Otherwise try fast path for simple statements
 * 3. Fall back to ScanStatement for edge cases
 */
export type ScanNext<S extends ParserState> = S['input'] extends `${string}{${string}`
  ? ScanStatement<S>
  : FastScanSimple<S['input']> extends [infer Stmt extends string, infer Rest extends string]
    ? State.AddStatement<S, Stmt, Rest>
    : ScanStatement<S>;

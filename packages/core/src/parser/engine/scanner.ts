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

// TODO -

/**
 * Scan a chunk of characters without special handling.
 * Optimized to process up to 16 characters at once to reduce recursion depth.
 */
type ScanChunk<
  Input extends string,
  Acc extends string = ''
> = Input extends `${infer C1}${infer C2}${infer C3}${infer C4}${infer C5}${infer C6}${infer C7}${infer C8}${infer C9}${infer C10}${infer C11}${infer C12}${infer C13}${infer C14}${infer C15}${infer C16}${infer Rest}`
  ? C1 extends '{' | '}' | ';'
    ? [Acc, Input]
    : C2 extends '{' | '}' | ';'
      ? [
          `${Acc}${C1}`,
          `${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
        ]
      : C3 extends '{' | '}' | ';'
        ? [
            `${Acc}${C1}${C2}`,
            `${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
          ]
        : C4 extends '{' | '}' | ';'
          ? [
              `${Acc}${C1}${C2}${C3}`,
              `${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
            ]
          : C5 extends '{' | '}' | ';'
            ? [
                `${Acc}${C1}${C2}${C3}${C4}`,
                `${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
              ]
            : C6 extends '{' | '}' | ';'
              ? [
                  `${Acc}${C1}${C2}${C3}${C4}${C5}`,
                  `${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
                ]
              : C7 extends '{' | '}' | ';'
                ? [
                    `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}`,
                    `${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
                  ]
                : C8 extends '{' | '}' | ';'
                  ? [
                      `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}`,
                      `${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
                    ]
                  : C9 extends '{' | '}' | ';'
                    ? [
                        `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}`,
                        `${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
                      ]
                    : C10 extends '{' | '}' | ';'
                      ? [
                          `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}`,
                          `${C10}${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
                        ]
                      : C11 extends '{' | '}' | ';'
                        ? [
                            `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}`,
                            `${C11}${C12}${C13}${C14}${C15}${C16}${Rest}`
                          ]
                        : C12 extends '{' | '}' | ';'
                          ? [
                              `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}`,
                              `${C12}${C13}${C14}${C15}${C16}${Rest}`
                            ]
                          : C13 extends '{' | '}' | ';'
                            ? [
                                `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}`,
                                `${C13}${C14}${C15}${C16}${Rest}`
                              ]
                            : C14 extends '{' | '}' | ';'
                              ? [
                                  `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}`,
                                  `${C14}${C15}${C16}${Rest}`
                                ]
                              : C15 extends '{' | '}' | ';'
                                ? [
                                    `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}`,
                                    `${C15}${C16}${Rest}`
                                  ]
                                : C16 extends '{' | '}' | ';'
                                  ? [
                                      `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}`,
                                      `${C16}${Rest}`
                                    ]
                                  : ScanChunk<
                                      Rest,
                                      `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}${C9}${C10}${C11}${C12}${C13}${C14}${C15}${C16}`
                                    >
  : // Try 8 chars
    Input extends `${infer C1}${infer C2}${infer C3}${infer C4}${infer C5}${infer C6}${infer C7}${infer C8}${infer Rest}`
    ? C1 extends '{' | '}' | ';'
      ? [Acc, Input]
      : C2 extends '{' | '}' | ';'
        ? [`${Acc}${C1}`, `${C2}${C3}${C4}${C5}${C6}${C7}${C8}${Rest}`]
        : C3 extends '{' | '}' | ';'
          ? [`${Acc}${C1}${C2}`, `${C3}${C4}${C5}${C6}${C7}${C8}${Rest}`]
          : C4 extends '{' | '}' | ';'
            ? [`${Acc}${C1}${C2}${C3}`, `${C4}${C5}${C6}${C7}${C8}${Rest}`]
            : C5 extends '{' | '}' | ';'
              ? [`${Acc}${C1}${C2}${C3}${C4}`, `${C5}${C6}${C7}${C8}${Rest}`]
              : C6 extends '{' | '}' | ';'
                ? [`${Acc}${C1}${C2}${C3}${C4}${C5}`, `${C6}${C7}${C8}${Rest}`]
                : C7 extends '{' | '}' | ';'
                  ? [`${Acc}${C1}${C2}${C3}${C4}${C5}${C6}`, `${C7}${C8}${Rest}`]
                  : C8 extends '{' | '}' | ';'
                    ? [`${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}`, `${C8}${Rest}`]
                    : ScanChunk<Rest, `${Acc}${C1}${C2}${C3}${C4}${C5}${C6}${C7}${C8}`>
    : // Try 4 chars
      Input extends `${infer C1}${infer C2}${infer C3}${infer C4}${infer Rest}`
      ? C1 extends '{' | '}' | ';'
        ? [Acc, Input]
        : C2 extends '{' | '}' | ';'
          ? [`${Acc}${C1}`, `${C2}${C3}${C4}${Rest}`]
          : C3 extends '{' | '}' | ';'
            ? [`${Acc}${C1}${C2}`, `${C3}${C4}${Rest}`]
            : C4 extends '{' | '}' | ';'
              ? [`${Acc}${C1}${C2}${C3}`, `${C4}${Rest}`]
              : ScanChunk<Rest, `${Acc}${C1}${C2}${C3}${C4}`>
      : // Single char fallback
        Input extends `${infer Char}${infer Rest}`
        ? Char extends '{' | '}' | ';'
          ? [Acc, Input]
          : ScanChunk<Rest, `${Acc}${Char}`>
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

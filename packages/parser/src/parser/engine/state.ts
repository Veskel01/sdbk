import type { Add1, Sub1, Trim } from '../../utils';

/**
 * Parser state machine for splitting SurrealQL statements.
 * Uses tail recursion optimization by passing a single state object.
 */
export interface ParserState {
  /** Remaining input to be parsed */
  input: string;
  /** Already parsed/consumed input */
  scanned: string;
  /** Collected statements */
  statements: string[];
  /** Current brace depth (for tracking { } blocks) */
  depth: number;
  /** Current statement being built */
  current: string;
}

/**
 * State transformation namespace.
 * All state transformations are pure and return new state objects.
 */
export declare namespace State {
  /**
   * Initialize parser state from input string.
   */
  export type Initialize<Input extends string> = {
    input: Input;
    scanned: '';
    statements: [];
    depth: 0;
    current: '';
  };

  /**
   * Update scanned position.
   */
  type UpdateScanned<S extends ParserState, Consumed extends string> = `${S['scanned']}${Consumed}`;

  /**
   * Add a character to current statement and advance input.
   */
  export type AddChar<S extends ParserState, Char extends string, Rest extends string> = {
    input: Rest;
    scanned: UpdateScanned<S, Char>;
    statements: S['statements'];
    depth: S['depth'];
    current: `${S['current']}${Char}`;
  };

  /**
   * Open a brace - increment depth.
   */
  export type OpenBrace<S extends ParserState, Rest extends string> = {
    input: Rest;
    scanned: UpdateScanned<S, '{'>;
    statements: S['statements'];
    depth: S['depth'] extends number ? Add1<S['depth']> : 1;
    current: `${S['current']}{`;
  };

  /**
   * Close a brace - decrement depth.
   */
  export type CloseBrace<S extends ParserState, Rest extends string> = {
    input: Rest;
    scanned: UpdateScanned<S, '}'>;
    statements: S['statements'];
    depth: S['depth'] extends number ? Sub1<S['depth']> : 0;
    current: `${S['current']}}`;
  };

  /**
   * Close brace and finish statement (when depth becomes 0).
   */
  export type CloseBraceAndFinish<
    S extends ParserState,
    Rest extends string
  > = Rest extends `;${infer AfterSemi}`
    ? {
        input: AfterSemi;
        scanned: UpdateScanned<S, '};'>;
        statements: [...S['statements'], Trim<`${S['current']}}`>];
        depth: 0;
        current: '';
      }
    : {
        input: Rest;
        scanned: UpdateScanned<S, '}'>;
        statements: S['statements'];
        depth: 0;
        current: `${S['current']}}`;
      };

  /**
   * Add semicolon to current statement (when inside braces).
   */
  export type AddSemicolon<S extends ParserState, Rest extends string> = {
    input: Rest;
    scanned: UpdateScanned<S, ';'>;
    statements: S['statements'];
    depth: S['depth'];
    current: `${S['current']};`;
  };

  /**
   * Finish current statement (when ; at depth 0).
   */
  export type FinishStatement<S extends ParserState, Rest extends string> = Trim<
    S['current']
  > extends ''
    ? {
        input: Rest;
        scanned: UpdateScanned<S, ';'>;
        statements: S['statements'];
        depth: 0;
        current: '';
      }
    : {
        input: Rest;
        scanned: UpdateScanned<S, ';'>;
        statements: [...S['statements'], Trim<S['current']>];
        depth: 0;
        current: '';
      };

  /**
   * Add a complete statement (fast path).
   */
  export type AddStatement<
    S extends ParserState,
    Stmt extends string,
    Rest extends string
  > = Trim<Stmt> extends ''
    ? {
        input: Rest;
        scanned: UpdateScanned<S, `${Stmt};`>;
        statements: S['statements'];
        depth: 0;
        current: '';
      }
    : {
        input: Rest;
        scanned: UpdateScanned<S, `${Stmt};`>;
        statements: [...S['statements'], Trim<Stmt>];
        depth: 0;
        current: '';
      };

  /**
   * Skip whitespace at start of input.
   */
  export type SkipWhitespace<S extends ParserState> = S['input'] extends ` ${infer Rest}`
    ? SkipWhitespace<{
        input: Rest;
        scanned: UpdateScanned<S, ' '>;
        statements: S['statements'];
        depth: S['depth'];
        current: S['current'];
      }>
    : S['input'] extends `\n${infer Rest}`
      ? SkipWhitespace<{
          input: Rest;
          scanned: UpdateScanned<S, '\n'>;
          statements: S['statements'];
          depth: S['depth'];
          current: S['current'];
        }>
      : S['input'] extends `\t${infer Rest}`
        ? SkipWhitespace<{
            input: Rest;
            scanned: UpdateScanned<S, '\t'>;
            statements: S['statements'];
            depth: S['depth'];
            current: S['current'];
          }>
        : S['input'] extends `\r${infer Rest}`
          ? SkipWhitespace<{
              input: Rest;
              scanned: UpdateScanned<S, '\r'>;
              statements: S['statements'];
              depth: S['depth'];
              current: S['current'];
            }>
          : S;

  /**
   * Finalize - return statements array.
   */
  export type Finalize<S extends ParserState> = Trim<S['current']> extends ''
    ? S['statements']
    : [...S['statements'], Trim<S['current']>];
}

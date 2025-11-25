import type { ScanNext } from './scanner';
import type { ParserState, State } from './state';

/**
 * Process statements in segments for better performance.
 * Each segment processes up to 5 statements before recursing.
 */
type SegmentSize = 5;

/**
 * Process a segment of statements.
 * Counts down to avoid deep nesting in length checks.
 */
type ProcessSegment<S extends ParserState, Remaining extends number> = Remaining extends 0
  ? S
  : S['input'] extends ''
    ? S
    : ProcessSegment<ScanNext<S>, DecrementSegment<Remaining>>;

/**
 * Decrement counter for segment processing.
 * Optimized lookup table for values 0-50.
 */
type DecrementSegment<N extends number> = [
  never,
  0,
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
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50
][N];

/**
 * Main parsing loop using tail recursion with segment-based processing.
 *
 * Each iteration processes up to 5 statements, then recurses.
 * This dramatically reduces recursion depth for large schemas.
 */
export type ParseLoop<S extends ParserState> = S['input'] extends ''
  ? State.Finalize<S>
  : ProcessSegment<S, SegmentSize> extends infer NewState extends ParserState
    ? NewState['input'] extends ''
      ? State.Finalize<NewState>
      : ParseLoop<NewState>
    : State.Finalize<S>;

/**
 * Parse statements from input string.
 * Entry point that initializes state and starts the loop.
 */
export type ParseStatements<Input extends string> = ParseLoop<State.Initialize<Input>>;

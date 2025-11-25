import type { Dec } from '../../utils/math';
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
    : ProcessSegment<ScanNext<S>, Dec<Remaining>>;

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

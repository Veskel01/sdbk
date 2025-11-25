/**
 * Sequence definition schema.
 *
 * Represents a parsed DEFINE SEQUENCE statement for generating
 * monotonically increasing numeric sequences.
 */
export interface SequenceSchema {
  /** The sequence name */
  name: string;
  /** The batch size for allocation */
  batch: number | undefined;
  /** The starting value */
  start: number | undefined;
  /** The timeout duration */
  timeout: string | undefined;
  /** Whether OVERWRITE modifier was used */
  overwrite: boolean;
  /** Whether IF NOT EXISTS modifier was used */
  ifNotExists: boolean;
}

/**
 * Parameter definition schema.
 *
 * Represents a parsed DEFINE PARAM statement for global database parameters.
 */
export interface ParamSchema {
  /** The parameter name (without $) */
  name: string;
  /** The parameter value expression */
  value: string | undefined;
  /** Permission clause (none, full, or where condition) */
  permissions: string | undefined;
  /** Optional comment */
  comment: string | undefined;
  /** Whether OVERWRITE modifier was used */
  overwrite: boolean;
  /** Whether IF NOT EXISTS modifier was used */
  ifNotExists: boolean;
}

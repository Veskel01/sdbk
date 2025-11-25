/**
 * Module definition schema.
 *
 * Represents a parsed DEFINE MODULE statement for Surrealism WASM modules.
 */
export interface ModuleSchema {
  /** The full module name (e.g., "mod::test") */
  name: string;
  /** The .surli file pointer */
  fileName: string | undefined;
  /** Whether OVERWRITE modifier was used */
  overwrite: boolean;
  /** Whether IF NOT EXISTS modifier was used */
  ifNotExists: boolean;
}

/**
 * Analyzer definition schema.
 */
export interface AnalyzerSchema {
  name: string;
  function: string | undefined;
  tokenizers: string[];
  filters: string[];
  comment: string | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

/**
 * Index definition schema.
 *
 * Represents a parsed DEFINE INDEX statement with all possible configurations.
 */
export interface IndexSchema {
  /** The name of the index */
  name: string;
  /** The table the index is defined on */
  table: string;
  /** Array of indexed field names */
  fields: string[];
  /** Whether the index enforces uniqueness */
  unique: boolean;
  /** The type of index */
  indexType: 'unique' | 'search' | 'fulltext' | 'count' | 'hnsw' | undefined;
  /** Whether OVERWRITE modifier was used */
  overwrite: boolean;
  /** Whether IF NOT EXISTS modifier was used */
  ifNotExists: boolean;
  /** Analyzer name for FULLTEXT indexes */
  analyzer: string | undefined;
  /** Optional comment */
  comment: string | undefined;
  /** Whether CONCURRENTLY modifier was used */
  concurrently: boolean;
  /** HNSW configuration if applicable */
  hnswConfig: HnswConfig | undefined;
}

/**
 * HNSW vector index configuration.
 */
export interface HnswConfig {
  /** Vector dimension */
  dimension: number | undefined;
  /** Vector data type */
  type: 'F64' | 'F32' | 'I64' | 'I32' | 'I16' | undefined;
  /** Distance function */
  dist: 'EUCLIDEAN' | 'COSINE' | 'MANHATTAN' | 'MINKOWSKI' | undefined;
  /** EF construction parameter */
  efc: number | undefined;
  /** M parameter (max connections) */
  m: number | undefined;
}

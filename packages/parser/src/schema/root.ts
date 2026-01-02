import type { EmptyObject } from '../utils';
import type { AccessSchema } from './access';
import type { AnalyzerSchema } from './analyzer';
import type { BucketSchema } from './bucket';
import type { ConfigSchema } from './config';
import type { EventSchema } from './event';
import type { FunctionSchema } from './function';
import type { IndexSchema } from './index-schema';
import type { ModuleSchema } from './module';
import type { ParamSchema } from './param';
import type { SequenceSchema } from './sequence';
import type { TableSchema } from './table';
import type { UserSchema } from './user';

/**
 * In‑memory view of a fully parsed SurrealDB schema.
 *
 * @remarks
 * This is the final product of {@link BuildSchema}: each map groups definitions
 * by their logical name (table, index, event, access method, and so on).
 */
export interface Schema {
  tables: Record<string, TableSchema>;
  indexes: Record<string, IndexSchema>;
  events: Record<string, EventSchema>;
  analyzers: Record<string, AnalyzerSchema>;
  functions: Record<string, FunctionSchema>;
  params: Record<string, ParamSchema>;
  accesses: Record<string, AccessSchema>;
  users: Record<string, UserSchema>;
  buckets: Record<string, BucketSchema>;
  configs: Record<string, ConfigSchema>;
  modules: Record<string, ModuleSchema>;
  sequences: Record<string, SequenceSchema>;
}

/**
 * Convenience type for an empty {@link Schema} with all maps initialised to `{}`.
 */
export type EmptySchema = {
  tables: EmptyObject;
  indexes: EmptyObject;
  events: EmptyObject;
  analyzers: EmptyObject;
  functions: EmptyObject;
  params: EmptyObject;
  accesses: EmptyObject;
  users: EmptyObject;
  buckets: EmptyObject;
  configs: EmptyObject;
  modules: EmptyObject;
  sequences: EmptyObject;
};

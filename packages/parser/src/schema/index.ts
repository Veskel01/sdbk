import type { SplitStatements } from '../parser';
import type { BuildSchema } from './builder';

export type * from './access';
export type * from './analyzer';
export type * from './bucket';
export type * from './builder';
export type * from './config';
export type * from './data-type';
export type * from './event';
export type * from './function';
export type * from './index-schema';
export type * from './module';
export type * from './param';
export type * from './root';
export type * from './sequence';
export type * from './table';
export type * from './user';

/**
 * Parses a SurrealQL string into a complete database schema.
 */
export type ParseSchema<Input extends string> = BuildSchema<SplitStatements<Input>>;

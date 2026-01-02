import type { AccessDuration, BearerTarget, JwtConfig, RecordJwtConfig } from '../statements';

/**
 * Parsed definition of an access method (`DEFINE ACCESS ...`).
 *
 * @remarks
 * This is the schema‑level counterpart of the various `AccessResult` types
 * and captures the normalized configuration for bearer / jwt / record access.
 */
export type AccessSchema = BearerAccessSchema | JwtAccessSchema | RecordAccessSchema;

/**
 * Schema representation of a `TYPE BEARER` access method.
 */
export interface BearerAccessSchema {
  name: string;
  level: 'namespace' | 'database';
  accessType: 'bearer';
  bearerFor: BearerTarget;
  authenticate: string | undefined;
  duration: AccessDuration | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

/**
 * Schema representation of a `TYPE JWT` access method.
 */
export interface JwtAccessSchema {
  name: string;
  level: 'root' | 'namespace' | 'database';
  accessType: 'jwt';
  jwt: JwtConfig;
  authenticate: string | undefined;
  sessionDuration: string | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

/**
 * Schema representation of a `TYPE RECORD` access method.
 */
export interface RecordAccessSchema {
  name: string;
  level: 'database';
  accessType: 'record';
  signup: string | undefined;
  signin: string | undefined;
  jwt: RecordJwtConfig | undefined;
  withRefresh: boolean;
  authenticate: string | undefined;
  duration: AccessDuration | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

import type {
  AccessDuration,
  BearerTarget,
  JwtConfig,
  RecordJwtConfig
} from '../statements/define/define-access';

/**
 * Access method definition schema - union of all access types.
 */
export type AccessSchema = BearerAccessSchema | JwtAccessSchema | RecordAccessSchema;

/**
 * Bearer access method schema.
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
 * JWT access method schema.
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
 * Record access method schema.
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

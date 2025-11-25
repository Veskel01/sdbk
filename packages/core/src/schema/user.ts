/**
 * Duration configuration for user tokens and sessions.
 */
export interface UserDurationSchema {
  /** Token duration */
  token: string | undefined;
  /** Session duration */
  session: string | undefined;
}

/**
 * User definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/user
 */
export interface UserSchema {
  /** The username */
  name: string;
  /** User level (root, namespace, or database) */
  level: 'root' | 'namespace' | 'database';
  /** Array of role names (OWNER, EDITOR, VIEWER) */
  roles: string[];
  /** Whether PASSWORD clause was used */
  hasPassword: boolean;
  /** Whether PASSHASH clause was used */
  hasPasshash: boolean;
  /** Token and session duration configuration */
  duration: UserDurationSchema | undefined;
  /** Optional comment */
  comment: string | undefined;
  /** Whether OVERWRITE modifier was used */
  overwrite: boolean;
  /** Whether IF NOT EXISTS modifier was used */
  ifNotExists: boolean;
}

/**
 * Prefix used for binding tokens in parameterized queries.
 * Used internally to generate unique parameter names.
 */
export const BINDING_TOKEN = 'bind__';

/**
 * Prefix character for query parameters in SurrealQL.
 * Parameters are referenced as `$paramName` in queries.
 */
export const QUERY_PARAM_TOKEN = '$';

/**
 * Statement terminator character in SurrealQL.
 * Each statement must end with a semicolon.
 */
export const STATEMENT_END_TOKEN = ';';

/**
 * Token representing an absent/undefined value in SurrealDB.
 * Used for optional fields that have no value set.
 *
 * @see https://surrealdb.com/docs/surrealql/datamodel/none_and_null
 */
export const NONE_TOKEN = 'NONE' as const;

/**
 * Token representing a null value in SurrealDB.
 * Used for nullable fields explicitly set to null.
 *
 * @see https://surrealdb.com/docs/surrealql/datamodel/none_and_null
 */
export const NULL_TOKEN = 'null' as const;

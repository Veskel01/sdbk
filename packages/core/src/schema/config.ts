/**
 * Configuration definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/config
 */
export interface ConfigSchema {
  configType: 'graphql' | 'api';
  overwrite: boolean;
  ifNotExists: boolean;
}

/**
 * API configuration schema.
 */
export interface ApiConfigSchema extends ConfigSchema {
  configType: 'api';
  middleware: string[];
  permissions: string | undefined;
}

/**
 * GraphQL configuration schema.
 */
export interface GraphQLConfigSchema extends ConfigSchema {
  configType: 'graphql';
  tables: string;
  functions: string;
}

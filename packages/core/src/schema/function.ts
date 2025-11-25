/**
 * Function parameter schema.
 */
export interface FunctionParamSchema {
  name: string;
  type: unknown;
}

/**
 * Function definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/function
 */
export interface FunctionSchema {
  name: string;
  params: FunctionParamSchema[];
  body: string | undefined;
  comment: string | undefined;
  permissions: string | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

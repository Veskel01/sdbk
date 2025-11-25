/**
 * Bucket definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/bucket
 */
export interface BucketSchema {
  name: string;
  backend: string | undefined;
  permissions: string | undefined;
  comment: string | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

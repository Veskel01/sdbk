/**
 * Event definition schema.
 * @see https://surrealdb.com/docs/surrealql/statements/define/event
 */
export interface EventSchema {
  name: string;
  table: string;
  when: string | undefined;
  then: string | undefined;
  comment: string | undefined;
  overwrite: boolean;
  ifNotExists: boolean;
}

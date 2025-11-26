import { KIND } from '../meta';
import { Identifier, type SQLConvertible, type SurrealQL, surql } from '../query';
import type { TableRef, WithPhantomProp } from './types';

export type FieldPermission = 'NONE' | 'FULL' | (string & {});

export interface FieldPermissions {
  readonly select?: FieldPermission;
  readonly create?: FieldPermission;
  readonly update?: FieldPermission;
}

export type OnDeleteBehavior = 'REJECT' | 'CASCADE' | 'IGNORE' | 'UNSET' | `THEN ${string}`;

/**
 * Define mode for field creation.
 * - `OVERWRITE` - overwrites existing field definition
 * - `IF NOT EXISTS` - creates field only if it doesn't exist
 */
export type DefineMode = 'OVERWRITE' | 'IF NOT EXISTS';

export interface $Field<TDataType extends string, TValueType> {
  readonly dataType: TDataType;
  readonly valueType: TValueType;
}

/**
 * A type that represents any field.
 */
export type AnyField = Field<any, any>;

export abstract class Field<TDataType extends string, TValueType>
  implements SQLConvertible<TValueType>, WithPhantomProp<$Field<TDataType, TValueType>>
{
  public static readonly [KIND]: string = 'Field';

  public declare readonly _: $Field<TDataType, TValueType>;

  private _permissions: FieldPermissions | undefined;
  private _comment: string | undefined;
  private _defineMode: DefineMode | undefined;

  public readonly table: TableRef;
  public readonly name: string;

  protected constructor(table: TableRef, name: string) {
    this.table = table;
    this.name = name;
  }

  protected set defineMode(mode: DefineMode | undefined) {
    this._defineMode = mode;
  }

  public toSurrealQL(): SurrealQL<TValueType> {
    const parts: SurrealQL[] = [];
    parts.push(this.buildDefineClause());
    parts.push(...this.buildSpecificClauses());

    const permsClause = this.buildPermissionsClause();
    if (permsClause) {
      parts.push(permsClause);
    }

    const commentClause = this.buildCommentClause();
    if (commentClause) {
      parts.push(commentClause);
    }

    return surql.join(parts, surql.raw('')) as SurrealQL<TValueType>;
  }

  protected abstract buildSpecificClauses(): SurrealQL[];

  protected set permissions(permissions: FieldPermissions | undefined) {
    this._permissions = permissions;
  }

  protected set comment(comment: string | undefined) {
    this._comment = comment;
  }

  protected buildDefineClause(): SurrealQL {
    const modeClause = this._defineMode ? ` ${this._defineMode}` : '';
    return surql`DEFINE FIELD${surql.raw(modeClause)} ${new Identifier(this.name)} ON TABLE ${new Identifier(this.table.tableName)}`;
  }

  protected buildPermissionsClause(): SurrealQL | null {
    const perms = this._permissions;
    if (!perms) {
      return null;
    }

    const { select, create, update } = perms;

    if (select === 'NONE' && create === 'NONE' && update === 'NONE') {
      return surql.raw(' PERMISSIONS NONE');
    }

    if (select === 'FULL' && create === 'FULL' && update === 'FULL') {
      return surql.raw(' PERMISSIONS FULL');
    }

    const clauses: string[] = [];
    if (select) {
      clauses.push(this.formatPermission('select', select));
    }
    if (create) {
      clauses.push(this.formatPermission('create', create));
    }
    if (update) {
      clauses.push(this.formatPermission('update', update));
    }

    return clauses.length > 0 ? surql.raw(` PERMISSIONS ${clauses.join(' ')}`) : null;
  }

  private formatPermission(action: string, permission: FieldPermission): string {
    return `FOR ${action} ${permission}`;
  }

  protected buildCommentClause(): SurrealQL | null {
    if (!this._comment) {
      return null;
    }

    return surql.raw(` COMMENT "${this._comment.replace(/"/g, '\\"')}"`);
  }
}

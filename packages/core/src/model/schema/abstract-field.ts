import { STATEMENT_END_TOKEN } from '../../constants';
import { ENTITY_KIND } from '../../meta';
import { Expression, type ExpressionWrapper, Identifier } from '../../query';
import type { AnyString } from '../../types';

/**
 * Permission level for field operations.
 * - `'NONE'` - No access allowed
 * - `'FULL'` - Full access allowed
 * - Custom WHERE clause string for conditional access
 */
export type FieldPermission = 'NONE' | 'FULL' | AnyString;

/**
 * Granular permissions for field operations.
 * Each operation can have its own permission level.
 */
export interface FieldPermissions {
  /** Permission for SELECT operations */
  readonly select?: FieldPermission;
  /** Permission for CREATE operations */
  readonly create?: FieldPermission;
  /** Permission for UPDATE operations */
  readonly update?: FieldPermission;
}

/**
 * Behavior when a referenced record is deleted.
 * - `'REJECT'` - Prevent deletion if references exist
 * - `'CASCADE'` - Delete referencing records
 * - `'IGNORE'` - Allow deletion, leave dangling references
 * - `'UNSET'` - Set the reference to NULL/undefined
 * - `THEN <expression>` - Execute custom expression
 */
export type FieldReference = 'REJECT' | 'CASCADE' | 'IGNORE' | 'UNSET' | `THEN ${string}`;

/**
 * Define mode for field creation.
 * - `'OVERWRITE'` - Overwrites existing field definition
 * - `'IF NOT EXISTS'` - Creates field only if it doesn't exist
 */
export type FieldDefineMode = 'OVERWRITE' | 'IF NOT EXISTS';

/**
 * Reference to a table for field definitions.
 */
export interface TableRef {
  /** The name of the table */
  readonly tableName: string;
}

/**
 * Phantom metadata type for compile-time type safety.
 * This type is never instantiated at runtime but provides type information.
 *
 * @typeParam TDataType - The SurrealDB data type string (e.g., 'string', 'int', 'record<users>')
 * @typeParam TValueType - The TypeScript type for values
 */
export interface $Field<TFieldName extends FieldName, TDataType extends string, TValueType> {
  readonly fieldName: TFieldName;
  readonly dataType: TDataType;
  readonly valueType: TValueType;
  // TODO - add table info here
}

/**
 * The name of a field.
 */
export type FieldName = string;

/**
 * A type that represents any field.
 */
export type AnyField = AbstractField<any, any, any>;

/**
 * Extracts the data type of a field.
 * @typeParam T - The field type
 * @returns The data type of the field
 */
export type ExtractFieldDataType<T extends AnyField> = T['_']['dataType'];

/**
 * Extracts the value type of a field.
 * @typeParam T - The field type
 * @returns The value type of the field
 */
export type ExtractFieldValueType<T extends AnyField> = T['_']['valueType'];

/**
 * Extracts the field name of a field.
 * @typeParam T - The field type
 * @returns The field name of the field
 */
export type ExtractFieldName<T extends AnyField> = T['_']['fieldName'];

/**
 * Configuration options for a field definition.
 * @typeParam TDataType - The SurrealDB data type string
 */
export interface FieldDefinition<TFieldName extends FieldName, TDataType extends string> {
  readonly fieldName: TFieldName;
  readonly dataType: TDataType;
  readonly table: TableRef;
  readonly defineMode?: FieldDefineMode;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

/**
 * Abstract base class for SurrealDB field definitions.
 * Provides common functionality for regular and computed fields.
 *
 * Implements:
 * - `ENTITY_KIND` pattern for cross-module type checking
 * - Phantom types for compile-time type safety
 * - Builder-friendly design with protected setters
 * - Complete permission system
 * - Comment support
 * - Define mode (OVERWRITE / IF NOT EXISTS)
 *
 * @typeParam TDataType - The SurrealDB data type string
 * @typeParam TValueType - The TypeScript type for field values
 *
 * @example
 * ```ts
 * class StringField extends Field<'string', string> {
 *   protected buildFieldClauses(): Expression[] {
 *     return [Expression.raw(' TYPE string')];
 *   }
 * }
 * ```
 */
export abstract class AbstractField<
  TFieldName extends FieldName,
  TDataType extends string,
  TValueType
> implements ExpressionWrapper<TValueType>
{
  /**
   * Entity kind identifier for cross-module type checking.
   * @internal
   */
  public static readonly [ENTITY_KIND]: string = 'field';

  /**
   * Phantom type property for compile-time type checking.
   * Never actually assigned at runtime.
   * @internal
   */
  public declare readonly _: $Field<TFieldName, TDataType, TValueType>;

  private readonly _dataType: TDataType;
  private _permissions: FieldPermissions | undefined;
  private _comment: string | undefined;
  private _defineMode: FieldDefineMode | undefined;

  public readonly fieldName: TFieldName;
  public readonly table: TableRef;

  /**
   * Creates a new Field instance.
   * @param table - The table reference this field belongs to
   * @param name - The name of the field
   */
  protected constructor({
    fieldName,
    dataType,
    table,
    comment,
    defineMode,
    permissions
  }: FieldDefinition<TFieldName, TDataType>) {
    this.table = table;
    this.fieldName = fieldName;
    this._dataType = dataType;
    this._defineMode = defineMode;
    this._permissions = permissions;
    this._comment = comment;
  }

  /**
   * Converts this field definition to a SurrealQL Expression.
   * Generates a complete DEFINE FIELD statement.
   *
   * @returns An Expression containing the full field definition
   *
   * @example
   * ```ts
   * const field = new StringField(table, 'name')
   *   .withComment('User display name')
   *   .withPermissions({ select: 'FULL', create: 'FULL', update: 'FULL' });
   *
   * const { query } = field.toSurrealQL().toQuery();
   * // DEFINE FIELD name ON TABLE users TYPE string PERMISSIONS FULL COMMENT "User display name"
   * ```
   */
  public toExpression(): Expression<TValueType> {
    const parts: Expression[] = [];

    // DEFINE FIELD clause
    parts.push(this.buildDefineClause());

    // Field-specific clauses (TYPE, VALUE, DEFAULT, ASSERT, etc.)
    parts.push(...this.buildFieldClauses());

    // PERMISSIONS clause
    const permsClause = this.buildPermissionsClause();
    if (permsClause) {
      parts.push(permsClause);
    }

    // COMMENT clause
    const commentClause = this.buildCommentClause();
    if (commentClause) {
      parts.push(commentClause);
    }

    // Statement end
    parts.push(Expression.raw(STATEMENT_END_TOKEN));

    return Expression.join(parts, Expression.raw('')) as Expression<TValueType>;
  }

  /**
   * Gets the data type of this field.
   */
  protected get dataType(): TDataType {
    return this._dataType;
  }

  /**
   * Gets the current define mode.
   */
  protected get defineMode(): FieldDefineMode | undefined {
    return this._defineMode;
  }

  /**
   * Sets the define mode for this field.
   * @param mode - The define mode to use
   */
  protected set defineMode(mode: FieldDefineMode | undefined) {
    this._defineMode = mode;
  }

  /**
   * Gets the current permissions.
   */
  protected get permissions(): FieldPermissions | undefined {
    return this._permissions;
  }

  /**
   * Sets the permissions for this field.
   * @param permissions - The permissions to set
   */
  protected set permissions(permissions: FieldPermissions | undefined) {
    this._permissions = permissions;
  }

  /**
   * Gets the current comment.
   */
  protected get comment(): string | undefined {
    return this._comment;
  }

  /**
   * Sets the comment for this field.
   * @param comment - The comment string
   */
  protected set comment(comment: string | undefined) {
    this._comment = comment;
  }

  /**
   * Builds the field-specific clauses (TYPE, VALUE, DEFAULT, ASSERT, etc.)
   * Must be implemented by subclasses.
   * @returns Array of Expression fragments for field-specific clauses
   */
  protected abstract buildFieldClauses(): Expression[];

  /**
   * Builds the DEFINE FIELD clause with optional mode.
   * @returns An Expression for the DEFINE FIELD clause
   */
  private buildDefineClause(): Expression {
    const modeClause = this._defineMode ? ` ${this._defineMode}` : '';
    const defineExpr = Expression.raw(`DEFINE FIELD${modeClause} `);

    return defineExpr
      .append(new Identifier(this.fieldName))
      .append(' ON TABLE ')
      .append(new Identifier(this.table.tableName));
  }

  /**
   * Builds the PERMISSIONS clause based on configured permissions.
   * Optimizes for NONE/FULL shortcuts when all permissions are the same.
   *
   * @returns An Expression for permissions or null if no permissions set
   */
  private buildPermissionsClause(): Expression | null {
    const perms = this._permissions;
    if (!perms) {
      return null;
    }

    const { select, create, update } = perms;

    // Shortcut: all NONE
    if (select === 'NONE' && create === 'NONE' && update === 'NONE') {
      return Expression.raw(' PERMISSIONS NONE');
    }

    // Shortcut: all FULL
    if (select === 'FULL' && create === 'FULL' && update === 'FULL') {
      return Expression.raw(' PERMISSIONS FULL');
    }

    // Build individual permission clauses
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

    if (clauses.length === 0) {
      return null;
    }

    return Expression.raw(` PERMISSIONS ${clauses.join(' ')}`);
  }

  /**
   * Formats a single permission clause.
   * @param action - The action (select/create/update)
   * @param permission - The permission level
   * @returns Formatted permission string
   */
  private formatPermission(action: string, permission: FieldPermission): string {
    return `FOR ${action} ${permission}`;
  }

  /**
   * Builds the COMMENT clause with proper escaping.
   *
   * @returns An Expression for the comment or null if no comment set
   */
  private buildCommentClause(): Expression | null {
    if (!this._comment) {
      return null;
    }

    // Escape double quotes in comment
    const escapedComment = this._comment.replace(/"/g, '\\"');
    return Expression.raw(` COMMENT "${escapedComment}"`);
  }
}

import { ENTITY_KIND } from '../../meta';
import { Expression, isExpression } from '../../query';
import {
  AbstractField,
  type FieldDefineMode,
  type FieldPermissions,
  type FieldReference,
  type TableRef
} from './abstract-field';

/**
 * List of phases for value mapping.
 */
export type ValueMappingPhase = 'FIELD:DEFAULT' | 'FIELD:VALUE';

/**
 * Interface for custom value mapping between application and database types.
 * Responsible for all value transformations including serialization to SurrealQL.
 *
 * @typeParam TDataType - The SurrealDB data type string
 * @typeParam TValue - The application-level TypeScript type
 */
export interface ValueMapper<TValue> {
  /** Convert application value to database format (for runtime operations) */
  mapToDatabaseValue(value: TValue, phase: ValueMappingPhase): unknown;
}

/**
 * Configuration options for a regular field definition.
 *
 * @typeParam TFieldName - The field name type
 * @typeParam TValue - The application-level TypeScript type for values
 */
export interface RegularFieldConfig<TValue> {
  /** Define mode: OVERWRITE or IF NOT EXISTS */
  readonly defineMode?: FieldDefineMode;
  /** Allow flexible schema (accepts any nested structure) */
  readonly flexible?: boolean;
  /** Prevent updates after creation */
  readonly readonly?: boolean;
  /** Default value - will be serialized using the mapper */
  readonly default?: TValue | Expression;
  /** Apply default on every update, not just creation */
  readonly defaultAlways?: boolean;
  /** Computed value expression (SurrealQL expression string or Expression) */
  readonly value?: TValue | Expression;
  /** Assertion expression that must evaluate to true */
  readonly assert?: string | Expression<boolean>;
  /** Referential integrity behavior on delete */
  readonly reference?: FieldReference;
  /** Field permissions */
  readonly permissions?: FieldPermissions;
  /** Field comment/description */
  readonly comment?: string;
}

/**
 * Regular field definition for SurrealDB.
 * Represents a field with an explicit TYPE clause.
 *
 * @typeParam TFieldName - The field name type
 * @typeParam TDataType - The SurrealDB data type string (e.g., 'string', 'int', 'record<users>')
 * @typeParam TValue - The application-level TypeScript type for this field
 *
 */
export class RegularField<
  TFieldName extends string,
  TDataType extends string,
  TValue
> extends AbstractField<TFieldName, TDataType, TValue> {
  public static override readonly [ENTITY_KIND]: string = 'RegularField';

  private readonly _mapper: ValueMapper<TValue>;
  private readonly _config: RegularFieldConfig<TValue>;

  public constructor(
    fieldName: TFieldName,
    dataType: TDataType,
    table: TableRef,
    mapper: ValueMapper<TValue>,
    config: RegularFieldConfig<TValue>
  ) {
    super({
      fieldName,
      dataType,
      table,
      comment: config.comment,
      defineMode: config.defineMode,
      permissions: config.permissions
    });
    this._mapper = mapper;
    this._config = config;
  }

  /**
   * Gets the value mapper for this field.
   */
  public get mapper(): ValueMapper<TValue> {
    return this._mapper;
  }

  /**
   * Builds field-specific clauses for DEFINE FIELD statement.
   * Order follows SurrealQL syntax: TYPE, REFERENCE, DEFAULT, READONLY, VALUE, ASSERT
   */
  protected override buildFieldClauses(): Expression[] {
    const clauses: Expression[] = [];

    // TYPE clause (required) - with optional FLEXIBLE modifier
    clauses.push(this.buildTypeClause());

    // REFERENCE clause (for record references)
    const referenceClause = this.buildReferenceClause();
    if (referenceClause) {
      clauses.push(referenceClause);
    }

    // DEFAULT clause
    const defaultClause = this.buildDefaultClause();
    if (defaultClause) {
      clauses.push(defaultClause);
    }

    // READONLY clause
    if (this._config.readonly) {
      clauses.push(Expression.raw(' READONLY'));
    }

    // VALUE clause
    const valueClause = this.buildValueClause();
    if (valueClause) {
      clauses.push(valueClause);
    }

    // ASSERT clause
    const assertClause = this.buildAssertClause();
    if (assertClause) {
      clauses.push(assertClause);
    }

    return clauses;
  }

  /**
   * Builds the TYPE clause with optional FLEXIBLE modifier.
   */
  private buildTypeClause(): Expression {
    const typeKeyword = this._config.flexible ? ' FLEXIBLE TYPE ' : ' TYPE ';
    return Expression.raw(`${typeKeyword}${this.dataType}`);
  }

  /**
   * Builds the REFERENCE ON DELETE clause for record fields.
   */
  private buildReferenceClause(): Expression | null {
    const { reference } = this._config;
    if (!reference) {
      return null;
    }

    return Expression.raw(` REFERENCE ON DELETE ${reference}`);
  }

  /**
   * Builds the DEFAULT clause with optional ALWAYS modifier.
   * Uses the mapper to serialize values.
   */
  private buildDefaultClause(): Expression | null {
    const { default: defaultValue, defaultAlways } = this._config;
    if (defaultValue === undefined) {
      return null;
    }

    const keyword = defaultAlways ? ' DEFAULT ALWAYS ' : ' DEFAULT ';

    if (isExpression(defaultValue)) {
      return Expression.raw(`${keyword}${defaultValue.serialize()}`);
    }

    return Expression.raw(
      `${keyword}${this._mapper.mapToDatabaseValue(defaultValue, 'FIELD:DEFAULT')}`
    );
  }

  /**
   * Builds the VALUE clause for computed/derived values.
   * Expects a SurrealQL expression string or Expression object.
   */
  private buildValueClause(): Expression | null {
    const { value } = this._config;
    if (value === undefined) {
      return null;
    }

    // If it's an Expression, serialize it
    if (isExpression(value)) {
      return Expression.raw(` VALUE ${value.serialize()}`);
    }

    // Otherwise it's a raw SurrealQL expression string
    return Expression.raw(` VALUE ${this._mapper.mapToDatabaseValue(value, 'FIELD:VALUE')}`);
  }

  /**
   * Builds the ASSERT clause for validation expressions.
   */
  private buildAssertClause(): Expression | null {
    const { assert } = this._config;
    if (!assert) {
      return null;
    }

    // If it's an Expression, serialize it
    if (isExpression(assert)) {
      return Expression.raw(` ASSERT ${assert.serialize()}`);
    }

    // Otherwise it's a raw SurrealQL expression string
    return Expression.raw(` ASSERT ${assert}`);
  }
}

import type { DataType, ParseDataType } from '@sdbk/parser';
import { KIND } from '../../meta';
import { type SurrealQL, surql } from '../../query';
import type { Override, ValueInput } from '../../util/types';
import { type DefineMode, Field, type FieldPermissions, type OnDeleteBehavior } from '../field';
import { serializeInput } from '../serialization';
import type { TableRef } from '../types';

/**
 * Configuration for a regular field definition.
 */
export interface RegularFieldConfig {
  readonly defineMode?: DefineMode;
  readonly flexible?: boolean;
  readonly readonly?: boolean;
  readonly default?: ValueInput<unknown>;
  readonly defaultAlways?: boolean;
  readonly value?: ValueInput<unknown>;
  readonly assert?: string | SurrealQL<boolean>;
  readonly reference?: OnDeleteBehavior;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

export class RegularField<
  TDataType extends DataType,
  TValueType = ParseDataType<TDataType>,
  TConfig extends RegularFieldConfig = RegularFieldConfig
> extends Field<TDataType, TValueType> {
  public static override readonly [KIND]: string = 'RegularField';

  private readonly _dataType: TDataType;
  private readonly _config: TConfig;

  public constructor(dataType: TDataType, table: TableRef, fieldName: string, config: TConfig) {
    super(table, fieldName);
    this._dataType = dataType;
    this._config = config;
    this.defineMode = config.defineMode;
    this.permissions = config.permissions;
    this.comment = config.comment;
  }

  protected override buildSpecificClauses(): SurrealQL[] {
    const clauses: SurrealQL[] = [];

    clauses.push(
      surql.raw(` ${this._config.flexible ? 'FLEXIBLE TYPE' : 'TYPE'} ${this._dataType}`)
    );

    if (this._config.reference) {
      clauses.push(surql.raw(` REFERENCE ON DELETE ${this._config.reference}`));
    }

    if (this._config.default !== undefined) {
      const defaultStr = serializeInput(this._config.default);
      clauses.push(
        surql.raw(` ${this._config.defaultAlways ? 'DEFAULT ALWAYS' : 'DEFAULT'} ${defaultStr}`)
      );
    }

    if (this._config.readonly) {
      clauses.push(surql.raw(' READONLY'));
    }

    if (this._config.value !== undefined) {
      const valueStr = serializeInput(this._config.value);
      clauses.push(surql.raw(` VALUE ${valueStr}`));
    }

    if (this._config.assert) {
      clauses.push(surql.raw(` ASSERT ${this._config.assert}`));
    }

    return clauses;
  }
}

export class RegularFieldBuilder<
  TDataType extends DataType,
  TValueType = ParseDataType<TDataType>,
  TConfig extends RegularFieldConfig = RegularFieldConfig
> {
  public static readonly [KIND]: string = 'RegularFieldBuilder';

  private readonly _dataType: TDataType;
  private readonly _config: TConfig;

  public constructor(dataType: TDataType, config: TConfig) {
    this._dataType = dataType;
    this._config = config;
  }

  public $type<TNewValueType extends ParseDataType<TDataType>>(): RegularFieldBuilder<
    TDataType,
    TNewValueType,
    TConfig
  > {
    return this as never;
  }

  public mode<TDefineMode extends DefineMode>(
    mode: TDefineMode
  ): RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { defineMode: TDefineMode }>> {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      defineMode: mode
    }) as RegularFieldBuilder<
      TDataType,
      TValueType,
      Override<TConfig, { defineMode: TDefineMode }>
    >;
  }

  public flexible(): RegularFieldBuilder<
    TDataType,
    TValueType,
    Override<TConfig, { flexible: true }>
  > {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      flexible: true
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { flexible: true }>>;
  }

  public readonly(): RegularFieldBuilder<
    TDataType,
    TValueType,
    Override<TConfig, { readonly: true }>
  > {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      readonly: true
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { readonly: true }>>;
  }

  public assert<A extends string | SurrealQL<boolean>>(
    expression: A
  ): RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { assert: A }>> {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      assert: expression
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { assert: A }>>;
  }

  public reference<B extends OnDeleteBehavior>(
    behavior: B
  ): RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { reference: B }>> {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      reference: behavior
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { reference: B }>>;
  }

  public permissions<P extends FieldPermissions>(
    permissions: P
  ): RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { permissions: P }>> {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      permissions
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { permissions: P }>>;
  }

  public comment(
    text: string
  ): RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { comment: string }>> {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      comment: text
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { comment: string }>>;
  }

  public default<V extends ValueInput<TValueType>>(
    input: V
  ): RegularFieldBuilder<
    TDataType,
    TValueType,
    Override<TConfig, { default: V; defaultAlways: false }>
  > {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      default: input,
      defaultAlways: false
    }) as RegularFieldBuilder<
      TDataType,
      TValueType,
      Override<TConfig, { default: V; defaultAlways: false }>
    >;
  }

  public defaultAlways<V extends ValueInput<TValueType>>(
    input: V
  ): RegularFieldBuilder<
    TDataType,
    TValueType,
    Override<TConfig, { default: V; defaultAlways: true }>
  > {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      default: input,
      defaultAlways: true
    }) as RegularFieldBuilder<
      TDataType,
      TValueType,
      Override<TConfig, { default: V; defaultAlways: true }>
    >;
  }

  public bindValue<V extends ValueInput<TValueType>>(
    input: V
  ): RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { value: V }>> {
    return new RegularFieldBuilder(this._dataType, {
      ...this._config,
      value: input
    }) as RegularFieldBuilder<TDataType, TValueType, Override<TConfig, { value: V }>>;
  }

  public build(table: TableRef, fieldName: string): RegularField<TDataType, TValueType, TConfig> {
    return new RegularField(this._dataType, table, fieldName, this._config);
  }
}

/**
 * Factory function to create a regular field builder.
 * @param dataType - The data type of the field.
 * @returns A regular field builder.
 */
export function regularField<TDataType extends DataType>(
  dataType: TDataType
): RegularFieldBuilder<TDataType> {
  return new RegularFieldBuilder(dataType, {});
}

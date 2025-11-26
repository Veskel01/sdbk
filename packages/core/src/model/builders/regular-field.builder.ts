import { ENTITY_KIND } from '../../meta';
import type { Expression } from '../../query';
import type { InferDataValueType, Override } from '../../types';
import {
  type FieldDefineMode,
  type FieldName,
  type FieldPermissions,
  type FieldReference,
  RegularField,
  type RegularFieldConfig,
  type TableRef,
  type ValueMapper
} from '../schema';

export type AnyRegularFieldBuilder = RegularFieldBuilder<any, any, any, any>;

export class RegularFieldBuilder<
  TDataType extends string,
  TValue,
  TConfig extends RegularFieldConfig<TValue>,
  TFieldName extends FieldName
> {
  public static readonly [ENTITY_KIND]: string = 'RegularFieldBuilder';

  private readonly _fieldName: TFieldName;
  private readonly _dataType: TDataType;
  private readonly _mapper: ValueMapper<TValue>;
  private readonly _config: RegularFieldConfig<TValue>;

  public constructor(
    fieldName: TFieldName,
    dataType: TDataType,
    mapper: ValueMapper<TValue>,
    config: RegularFieldConfig<TValue>
  ) {
    this._fieldName = fieldName;
    this._dataType = dataType;
    this._mapper = mapper;
    this._config = config;
  }

  public build(table: TableRef): RegularField<TFieldName, TDataType, TValue> {
    return new RegularField(this._fieldName, this._dataType, table, this._mapper, this._config);
  }

  public mode<M extends FieldDefineMode>(
    mode: M
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { defineMode: M }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      defineMode: mode
    });
  }

  public flexible(): RegularFieldBuilder<
    TDataType,
    TValue,
    Override<TConfig, { flexible: true }>,
    TFieldName
  > {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      flexible: true
    });
  }

  public readonly(): RegularFieldBuilder<
    TDataType,
    TValue,
    Override<TConfig, { readonly: true }>,
    TFieldName
  > {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      readonly: true
    });
  }

  public assert<E extends string | Expression<boolean>>(
    expression: E
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { assert: E }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      assert: expression
    });
  }

  public reference<B extends FieldReference>(
    behavior: B
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { reference: B }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      reference: behavior
    });
  }

  public permissions<P extends FieldPermissions>(
    permissions: P
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { permissions: P }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      permissions
    });
  }

  public comment(
    text: string
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { comment: string }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      comment: text
    });
  }

  public default<V extends TValue | Expression>(
    input: V
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { default: V }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      default: input
    });
  }

  public defaultAlways<V extends TValue | Expression>(
    input: V
  ): RegularFieldBuilder<
    TDataType,
    TValue,
    Override<TConfig, { default: V; defaultAlways: true }>,
    TFieldName
  > {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      default: input,
      defaultAlways: true
    });
  }

  public value<V extends TValue | Expression>(
    input: V
  ): RegularFieldBuilder<TDataType, TValue, Override<TConfig, { value: V }>, TFieldName> {
    return new RegularFieldBuilder(this._fieldName, this._dataType, this._mapper, {
      ...this._config,
      value: input
    });
  }
}

export function constructRegularField<
  TFieldName extends FieldName,
  TDataType extends string,
  TValue = InferDataValueType<TDataType>
>(
  fieldName: TFieldName,
  dataType: TDataType,
  mapper: ValueMapper<TValue>
): RegularFieldBuilder<TDataType, TValue, RegularFieldConfig<TValue>, TFieldName> {
  return new RegularFieldBuilder<TDataType, TValue, RegularFieldConfig<TValue>, TFieldName>(
    fieldName,
    dataType,
    mapper,
    {}
  );
}

import type { ParseDataType } from '@sdbk/parser';
import type { SurrealQL } from '../expression';
import type { If, Simplify } from '../types';

export type FieldPermission = 'NONE' | 'FULL' | (string & {});

export interface FieldPermissions {
  readonly select?: FieldPermission;
  readonly create?: FieldPermission;
  readonly update?: FieldPermission;
}

export type OnDeleteBehavior = 'REJECT' | 'CASCADE' | 'IGNORE' | 'UNSET' | `THEN ${string}`;

export interface $Field<
  TDataType extends string = string,
  TValue = ParseDataType<TDataType>,
  TOptional extends boolean = boolean,
  TReadonly extends boolean = boolean
> {
  readonly _dataType: TDataType;
  readonly _value: TValue;
  readonly _optional: TOptional;
  readonly _readonly: TReadonly;
}

export interface TableRef {
  readonly tableName: string;
}

export type DefaultExpr<T = unknown> = T | string | SurrealQL<T>;
export type ValueExpr<T = unknown> = string | SurrealQL<T>;
export type AssertExpr = string | SurrealQL<boolean>;
export type ComputedExpr<T = unknown> = string | SurrealQL<T>;

export interface RegularFieldConfig<TDataType extends string> {
  readonly dataType: TDataType;
  readonly flexible?: boolean;
  readonly readonly?: boolean;
  readonly default?: string;
  readonly defaultAlways?: boolean;
  readonly value?: string;
  readonly assert?: string;
  readonly reference?: OnDeleteBehavior;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

export interface RegularFieldBuilderConfig<
  TDataType extends string = string,
  TValue = ParseDataType<TDataType>
> {
  readonly dataType: TDataType;
  readonly flexible?: boolean;
  readonly readonly?: boolean;
  readonly default?: DefaultExpr<TValue>;
  readonly defaultAlways?: boolean;
  readonly value?: ValueExpr<TValue>;
  readonly assert?: AssertExpr;
  readonly reference?: OnDeleteBehavior;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

export interface ComputedFieldConfig<TDataType extends string> {
  readonly expression: string;
  readonly dataType?: TDataType;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

export interface ComputedFieldBuilderConfig<
  TDataType extends string,
  TValue = ParseDataType<TDataType>
> {
  readonly expression: ComputedExpr<TValue>;
  readonly dataType?: TDataType;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

type FieldMeta<F> = F extends { readonly _: infer M } ? M : never;

type InferValue<F> = FieldMeta<F> extends $Field<string, infer V, infer O, boolean>
  ? If<O, V | null, V>
  : never;

type IsReadonly<F> = FieldMeta<F> extends $Field<string, unknown, boolean, infer R> ? R : false;

export type InferFieldType<S extends Record<string, { readonly _: $Field }>> = Simplify<
  {
    readonly [K in keyof S as IsReadonly<S[K]> extends true ? K : never]: InferValue<S[K]>;
  } & {
    [K in keyof S as IsReadonly<S[K]> extends true ? never : K]: InferValue<S[K]>;
  }
>;

export type FieldValue<TType extends string, TOptional extends boolean> = If<
  TOptional,
  ParseDataType<TType> | null,
  ParseDataType<TType>
>;

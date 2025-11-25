import type { SurrealQL } from '../expression';
import type { ParseFieldType } from '../types';
import type { If, Simplify } from '../types/utility';

export type FieldPermission = 'NONE' | 'FULL' | (string & {});

export interface FieldPermissions {
  readonly select?: FieldPermission;
  readonly create?: FieldPermission;
  readonly update?: FieldPermission;
}

export type OnDeleteBehavior = 'REJECT' | 'CASCADE' | 'IGNORE' | 'UNSET' | `THEN ${string}`;

export interface $Field<
  TType extends string = string,
  TValue = unknown,
  TOptional extends boolean = boolean,
  TReadonly extends boolean = boolean
> {
  readonly _type: TType;
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

export interface RegularFieldConfig<TType extends string = string> {
  readonly type: TType;
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

export interface RegularFieldBuilderConfig<TType extends string = string, TValue = unknown> {
  readonly type: TType;
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

export interface ComputedFieldConfig<TType extends string = string> {
  readonly expression: string;
  readonly type?: TType;
  readonly permissions?: FieldPermissions;
  readonly comment?: string;
}

export interface ComputedFieldBuilderConfig<TType extends string = string, TValue = unknown> {
  readonly expression: ComputedExpr<TValue>;
  readonly type?: TType;
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
  ParseFieldType<TType> | null,
  ParseFieldType<TType>
>;

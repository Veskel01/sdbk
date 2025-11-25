// import type { DataType, ParseDataType } from '@sdbk/parser';
// import { ENTITY_KIND } from '../entity';
// import type { SurrealQL } from '../expression';
// import { ComputedField } from './field';
// import type {
//   $Field,
//   ComputedExpr,
//   ComputedFieldBuilderConfig,
//   FieldPermissions,
//   TableRef
// } from './types';

// TODO - to be removed

// function exprToString<T>(expr: string | SurrealQL<T>): string {
//   if (typeof expr === 'string') {
//     return expr;
//   }
//   return expr.toQuery().query;
// }

// export class ComputedFieldBuilder<
//   TDataType extends string = string,
//   TValue = ParseDataType<TDataType>
// > {
//   public static readonly [ENTITY_KIND]: string = 'ComputedFieldBuilder';

//   public declare readonly _: $Field<TDataType, TValue, false>;

//   private readonly config: ComputedFieldBuilderConfig<TDataType, TValue>;

//   public constructor(
//     expression: ComputedExpr<TValue>,
//     config?: Partial<Omit<ComputedFieldBuilderConfig<TDataType, TValue>, 'expression'>>
//   ) {
//     this.config = { expression, ...config };
//   }

//   public get expression(): ComputedExpr<TValue> {
//     return this.config.expression;
//   }

//   public build<TTable extends TableRef>(
//     table: TTable,
//     name: string
//   ): ComputedField<TDataType, TValue> {
//     return new ComputedField<TDataType, TValue>(table, name, {
//       dataType: this.config.dataType,
//       permissions: this.config.permissions,
//       comment: this.config.comment,
//       expression: exprToString(this.config.expression)
//     });
//   }

//   public type<TNewType extends DataType>(
//     typeString: TNewType
//   ): ComputedFieldBuilder<TNewType, ParseDataType<TNewType>> {
//     return new ComputedFieldBuilder<TNewType, ParseDataType<TNewType>>(
//       exprToString(this.config.expression),
//       {
//         dataType: typeString,
//         permissions: this.config.permissions,
//         comment: this.config.comment
//       }
//     );
//   }

//   public $type<TNewValue>(): ComputedFieldBuilder<TDataType, TNewValue> {
//     return this as unknown as ComputedFieldBuilder<TDataType, TNewValue>;
//   }

//   public permissions(perms: FieldPermissions): ComputedFieldBuilder<TDataType, TValue> {
//     return new ComputedFieldBuilder<TDataType, TValue>(this.config.expression, {
//       ...this.config,
//       permissions: perms
//     });
//   }

//   public comment(text: string): ComputedFieldBuilder<TDataType, TValue> {
//     return new ComputedFieldBuilder<TDataType, TValue>(this.config.expression, {
//       ...this.config,
//       comment: text
//     });
//   }
// }

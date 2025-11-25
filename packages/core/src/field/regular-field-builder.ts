// import type { ParseDataType } from '@sdbk/parser';
// import { ENTITY_KIND } from '../entity';
// import { isSQLConvertible, type SurrealQL } from '../expression';
// import { RegularField } from './field';
// import type {
//   $Field,
//   AssertExpr,
//   DefaultExpr,
//   FieldPermissions,
//   OnDeleteBehavior,
//   RegularFieldBuilderConfig,
//   TableRef,
//   ValueExpr
// } from './types';

// TODO - to be removed

// type OptionalType<T extends string> = `option<${T}>`;

// function valueToSurrealQL(value: unknown): string {
//   if (value === null) {
//     return 'NONE';
//   }
//   if (typeof value === 'string') {
//     return `'${value.replace(/'/g, "\\'")}'`;
//   }
//   if (typeof value === 'number' || typeof value === 'boolean') {
//     return String(value);
//   }
//   if (value instanceof Date) {
//     return `d'${value.toISOString()}'`;
//   }
//   if (Array.isArray(value)) {
//     return `[${value.map(valueToSurrealQL).join(', ')}]`;
//   }
//   if (typeof value === 'object') {
//     const entries = Object.entries(value)
//       .map(([k, v]) => `${k}: ${valueToSurrealQL(v)}`)
//       .join(', ');
//     return `{ ${entries} }`;
//   }
//   return String(value);
// }

// function defaultExprToString<T>(expr: DefaultExpr<T>): string {
//   if (typeof expr === 'string') {
//     return expr;
//   }
//   if (isSQLConvertible(expr)) {
//     return expr.toSurrealQL().toQuery().query;
//   }
//   return valueToSurrealQL(expr);
// }

// function exprToString<T>(expr: string | SurrealQL<T>): string {
//   if (typeof expr === 'string') {
//     return expr;
//   }
//   return expr.toQuery().query;
// }

// export class RegularFieldBuilder<
//   TDataType extends string,
//   TValue = ParseDataType<TDataType>,
//   TOptional extends boolean = false,
//   TReadonly extends boolean = false
// > {
//   public static readonly [ENTITY_KIND]: string = 'RegularFieldBuilder';

//   public declare readonly _: $Field<TDataType, TValue, TOptional, TReadonly>;

//   private readonly config: RegularFieldBuilderConfig<TDataType, TValue>;

//   public constructor(
//     dataType: TDataType,
//     config?: Partial<Omit<RegularFieldBuilderConfig<TDataType, TValue>, 'dataType'>>
//   ) {
//     this.config = { dataType, ...config };
//   }

//   public build<TTable extends TableRef>(
//     table: TTable,
//     name: string
//   ): RegularField<TDataType, TValue, TOptional> {
//     return new RegularField<TDataType, TValue, TOptional>(table, name, {
//       dataType: this.config.dataType,
//       flexible: this.config.flexible,
//       readonly: this.config.readonly,
//       defaultAlways: this.config.defaultAlways,
//       reference: this.config.reference,
//       permissions: this.config.permissions,
//       comment: this.config.comment,
//       default:
//         this.config.default !== undefined ? defaultExprToString(this.config.default) : undefined,
//       value: this.config.value !== undefined ? exprToString(this.config.value) : undefined,
//       assert: this.config.assert !== undefined ? exprToString(this.config.assert) : undefined
//     });
//   }

//   public optional(): RegularFieldBuilder<
//     OptionalType<TDataType>,
//     ParseDataType<OptionalType<TDataType>>,
//     true,
//     TReadonly
//   > {
//     const newType = `option<${this.config.dataType}>` as OptionalType<TDataType>;
//     return new RegularFieldBuilder<
//       OptionalType<TDataType>,
//       ParseDataType<OptionalType<TDataType>>,
//       true,
//       TReadonly
//     >(newType, this.config as never);
//   }

//   public $type<TNewValue>(): RegularFieldBuilder<TDataType, TNewValue, TOptional, TReadonly> {
//     return this as never;
//   }

//   public flexible(): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       flexible: true
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public readonly(): RegularFieldBuilder<TDataType, TValue, TOptional, true> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, true>(this.config.dataType, {
//       ...this.config,
//       readonly: true
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, true>;
//   }

//   public default(
//     expression: DefaultExpr<TValue>
//   ): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       default: expression,
//       defaultAlways: false
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public defaultAlways(
//     expression: DefaultExpr<TValue>
//   ): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       default: expression,
//       defaultAlways: true
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public value(
//     expression: ValueExpr<TValue>
//   ): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       value: expression
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public assert(
//     expression: AssertExpr
//   ): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       assert: expression
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public reference<TBehavior extends OnDeleteBehavior>(
//     behavior: TBehavior
//   ): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       reference: behavior
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public permissions(
//     perms: FieldPermissions
//   ): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       permissions: perms
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }

//   public comment(text: string): RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly> {
//     return new RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>(this.config.dataType, {
//       ...this.config,
//       comment: text
//     }) as RegularFieldBuilder<TDataType, TValue, TOptional, TReadonly>;
//   }
// }

// import type { DataType, ParseDataType } from '@sdbk/parser';
// import { KIND } from '../../meta';
// import { type SurrealQL, surql } from '../../query';
// import type { Override, ValueInput } from '../../util/types';
// import { type DefineMode, Field, type FieldPermissions } from '../field';
// import type { TableRef } from '../types';

// TODO: Implement computed fields

// /**
//  * Configuration for a computed field definition.
//  * Computed fields are not stored but calculated every time they are accessed.
//  */
// export interface ComputedFieldConfig<TValueType = unknown> {
//   readonly defineMode?: DefineMode;
//   readonly computed: ValueInput<TValueType>;
//   readonly dataType?: DataType;
//   readonly permissions?: FieldPermissions;
//   readonly comment?: string;
// }

// /**
//  * A computed field that is calculated every time it is accessed.
//  * Available since SurrealDB v3.0.0-alpha.8
//  *
//  * @example
//  * ```sql
//  * DEFINE FIELD full_name ON TABLE user COMPUTED first_name + ' ' + last_name
//  * ```
//  */
// export class ComputedField<
//   TValueType = unknown,
//   TConfig extends ComputedFieldConfig<TValueType> = ComputedFieldConfig<TValueType>
// > extends Field<string, TValueType> {
//   public static override readonly [KIND]: string = 'ComputedField';

//   private readonly _config: TConfig;

//   public constructor(table: TableRef, name: string, config: TConfig) {
//     super(table, name);
//     this._config = config;
//     this.defineMode = config.defineMode;
//     this.permissions = config.permissions;
//     this.comment = config.comment;
//   }

//   protected override buildSpecificClauses(): SurrealQL[] {
//     const clauses: SurrealQL[] = [];

//     // COMPUTED is required
//     clauses.push(surql.raw(` COMPUTED ${this._config.computed}`));

//     // TYPE is optional for computed fields
//     if (this._config.dataType) {
//       clauses.push(surql.raw(` TYPE ${this._config.dataType}`));
//     }

//     return clauses;
//   }
// }

// /**
//  * Builder for creating computed field definitions with type safety.
//  *
//  * @example
//  * ```typescript
//  * computedField('first_name + " " + last_name')
//  *   .$type<string>()
//  *   .type('string')
//  *   .comment('Full name of the user')
//  *   .build(table, 'full_name');
//  * ```
//  */
// export class ComputedFieldBuilder<
//   TValueType = unknown,
//   TConfig extends ComputedFieldConfig<TValueType> = ComputedFieldConfig<TValueType>
// > {
//   public static readonly [KIND]: string = 'ComputedFieldBuilder';

//   private readonly _config: TConfig;

//   public constructor(config: TConfig) {
//     this._config = config;
//   }

//   /**
//    * Override the TypeScript value type for this field.
//    */
//   public $type<TNewValueType>(): ComputedFieldBuilder<
//     TNewValueType,
//     ComputedFieldConfig<TNewValueType>
//   > {
//     return this as never;
//   }

//   /**
//    * Set the define mode (OVERWRITE or IF NOT EXISTS).
//    */
//   public mode<TDefineMode extends DefineMode>(
//     mode: TDefineMode
//   ): ComputedFieldBuilder<TValueType, Override<TConfig, { defineMode: TDefineMode }>> {
//     return new ComputedFieldBuilder({
//       ...this._config,
//       defineMode: mode
//     }) as ComputedFieldBuilder<TValueType, Override<TConfig, { defineMode: TDefineMode }>>;
//   }

//   /**
//    * Set the optional TYPE clause for the computed field.
//    */
//   public type<TDataType extends DataType>(
//     dataType: TDataType
//   ): ComputedFieldBuilder<ParseDataType<TDataType>, Override<TConfig, { dataType: TDataType }>> {
//     return new ComputedFieldBuilder({
//       ...this._config,
//       dataType
//     }) as ComputedFieldBuilder<
//       ParseDataType<TDataType>,
//       Override<TConfig, { dataType: TDataType }>
//     >;
//   }

//   /**
//    * Set permissions for the computed field.
//    */
//   public permissions<P extends FieldPermissions>(
//     permissions: P
//   ): ComputedFieldBuilder<TValueType, Override<TConfig, { permissions: P }>> {
//     return new ComputedFieldBuilder({
//       ...this._config,
//       permissions
//     }) as ComputedFieldBuilder<TValueType, Override<TConfig, { permissions: P }>>;
//   }

//   /**
//    * Add a comment to the field definition.
//    */
//   public comment(
//     text: string
//   ): ComputedFieldBuilder<TValueType, Override<TConfig, { comment: string }>> {
//     return new ComputedFieldBuilder({
//       ...this._config,
//       comment: text
//     }) as ComputedFieldBuilder<TValueType, Override<TConfig, { comment: string }>>;
//   }

//   /**
//    * Build the computed field with the given table and name.
//    */
//   public build(table: TableRef, name: string): ComputedField<TValueType, TConfig> {
//     return new ComputedField(table, name, this._config);
//   }
// }

// /**
//  * Create a new computed field builder.
//  *
//  * @param expression - The SurrealQL expression to compute
//  * @example
//  * ```typescript
//  * // Simple computed field
//  * computedField('first_name + " " + last_name')
//  *   .$type<string>()
//  *   .build(table, 'full_name');
//  *
//  * // With type and comment
//  * computedField('time::now()')
//  *   .type('datetime')
//  *   .comment('Current access time')
//  *   .build(table, 'accessed_at');
//  * ```
//  */
// export function computedField<TExpression extends ValueInput<unknown>>(
//   expression: TExpression
// ): ComputedFieldBuilder<unknown, ComputedFieldConfig<unknown>> {
//   return new ComputedFieldBuilder({ computed: expression });
// }

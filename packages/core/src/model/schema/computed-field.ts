// TODO - implement this

// /**
//  * Computed field builders for SurrealDB.
//  *
//  * Computed fields are not stored but calculated every time they are accessed.
//  * Available since SurrealDB v3.0.0-alpha.8
//  *
//  * @module
//  */

// import type { ParseDataType } from '@sdbk/parser';
// import { KIND } from '../../meta';
// import { type SurrealQL, surql } from '../../query';
// import { type DefineMode, Field, type FieldPermissions } from '../field';
// import type { TableRef } from '../types';

// // =============================================================================
// // Computed Field Runtime Config
// // =============================================================================

// /**
//  * Runtime configuration for computed fields.
//  */
// export interface ComputedFieldRuntimeConfig<TData = unknown> {
//   /** Field name */
//   name: string;
//   /** The computed expression */
//   computed: string | SurrealQL;
//   /** Optional data type for the computed result */
//   dataType: string | undefined;
//   /** Define mode */
//   defineMode: DefineMode | undefined;
//   /** Field permissions */
//   permissions: FieldPermissions | undefined;
//   /** Field comment */
//   comment: string | undefined;
// }

// // =============================================================================
// // Computed Field
// // =============================================================================

// /**
//  * A computed field that is calculated every time it is accessed.
//  *
//  * @template TValueType - The TypeScript type of the computed value
//  *
//  * @example
//  * ```sql
//  * DEFINE FIELD full_name ON TABLE user COMPUTED first_name + ' ' + last_name
//  * ```
//  */
// export class ComputedField<TValueType = unknown> extends Field<string, TValueType> {
//   public static override readonly [KIND]: string = 'ComputedField';

//   private readonly _computed: string | SurrealQL;
//   private readonly _dataType: string | undefined;

//   public constructor(
//     table: TableRef,
//     name: string,
//     config: ComputedFieldRuntimeConfig<TValueType>
//   ) {
//     super(table, name);
//     this._computed = config.computed;
//     this._dataType = config.dataType;
//     this.defineMode = config.defineMode;
//     this.permissions = config.permissions;
//     this.comment = config.comment;
//   }

//   /**
//    * Maps a value from the database to the TypeScript type.
//    */
//   public override mapFromDbValue(value: unknown): TValueType {
//     return value as TValueType;
//   }

//   /**
//    * Maps a TypeScript value to the database type.
//    * Note: Computed fields are read-only, this is for interface compatibility.
//    */
//   public override mapToDbValue(value: TValueType): unknown {
//     return value;
//   }

//   protected override buildSpecificClauses(): SurrealQL[] {
//     const clauses: SurrealQL[] = [];

//     // COMPUTED clause (required)
//     const computedStr =
//       typeof this._computed === 'string' ? this._computed : this._computed.toQuery().query;
//     clauses.push(surql.raw(` COMPUTED ${computedStr}`));

//     // TYPE clause (optional)
//     if (this._dataType) {
//       clauses.push(surql.raw(` TYPE ${this._dataType}`));
//     }

//     return clauses;
//   }
// }

// // =============================================================================
// // Computed Field Builder
// // =============================================================================

// /**
//  * Builder for creating computed field definitions.
//  *
//  * @template TValueType - The TypeScript type of the computed value
//  *
//  * @example
//  * ```typescript
//  * const fullName = computed('first_name + " " + last_name')
//  *   .$type<string>()
//  *   .comment('Full name of the user');
//  *
//  * const accessedAt = computed('time::now()')
//  *   .type('datetime')
//  *   .comment('Current access time');
//  * ```
//  */
// export class ComputedFieldBuilder<TValueType = unknown> {
//   public static readonly [KIND]: string = 'ComputedFieldBuilder';

//   /**
//    * Phantom property for compile-time type tracking.
//    */
//   public declare readonly _: { data: TValueType };

//   private readonly config: ComputedFieldRuntimeConfig<TValueType>;

//   public constructor(expression: string | SurrealQL) {
//     this.config = {
//       name: '',
//       computed: expression,
//       dataType: undefined,
//       defineMode: undefined,
//       permissions: undefined,
//       comment: undefined
//     };
//   }

//   /**
//    * Overrides the inferred TypeScript type for this computed field.
//    *
//    * @example
//    * ```typescript
//    * const fullName = computed('first_name + " " + last_name').$type<string>();
//    * ```
//    */
//   public $type<TNewType>(): ComputedFieldBuilder<TNewType> {
//     return this as unknown as ComputedFieldBuilder<TNewType>;
//   }

//   /**
//    * Sets the optional TYPE clause for the computed result.
//    *
//    * @param dataType - The SurrealQL data type
//    *
//    * @example
//    * ```typescript
//    * const total = computed('math::sum(items.*.price)').type('decimal');
//    * ```
//    */
//   public type<T extends string>(dataType: T): ComputedFieldBuilder<ParseDataType<T>> {
//     this.config.dataType = dataType;
//     return this as unknown as ComputedFieldBuilder<ParseDataType<T>>;
//   }

//   /**
//    * Sets the define mode for the field.
//    *
//    * @param mode - 'OVERWRITE' or 'IF NOT EXISTS'
//    */
//   public mode(mode: DefineMode): this {
//     this.config.defineMode = mode;
//     return this;
//   }

//   /**
//    * Sets field-level permissions.
//    *
//    * @param permissions - The permissions configuration
//    */
//   public permissions(permissions: FieldPermissions): this {
//     this.config.permissions = permissions;
//     return this;
//   }

//   /**
//    * Adds a comment to the field definition.
//    *
//    * @param text - The comment text
//    */
//   public comment(text: string): this {
//     this.config.comment = text;
//     return this;
//   }

//   /**
//    * Returns the runtime configuration.
//    * @internal
//    */
//   public getConfig(): ComputedFieldRuntimeConfig<TValueType> {
//     return this.config;
//   }

//   /**
//    * Sets the field name.
//    * @internal
//    */
//   public setName(name: string): void {
//     this.config.name = name;
//   }

//   /**
//    * Builds the computed field.
//    *
//    * @param table - The table reference
//    * @param name - The field name
//    */
//   public build(table: TableRef, name: string): ComputedField<TValueType> {
//     this.setName(name);
//     return new ComputedField<TValueType>(table, name, this.config);
//   }
// }

// // =============================================================================
// // Factory Function
// // =============================================================================

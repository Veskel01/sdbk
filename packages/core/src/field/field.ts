// import type { ParseDataType } from '@sdbk/parser';
// import { ENTITY_KIND } from '../entity';
// import { Identifier, type SQLConvertible, type SurrealQL, surql } from '../expression';
// import type {
//   $Field,
//   ComputedFieldConfig,
//   FieldPermission,
//   FieldPermissions,
//   OnDeleteBehavior,
//   RegularFieldConfig,
//   TableRef
// } from './types';

// TODO - to be removed

// export abstract class Field<
//   TDataType extends string = string,
//   TValue = ParseDataType<TDataType>,
//   TOptional extends boolean = false
// > implements SQLConvertible<TValue>
// {
//   public static readonly [ENTITY_KIND]: string = 'Field';

//   public declare readonly _: $Field<TDataType, TValue, TOptional>;

//   public readonly table: TableRef;
//   public readonly name: string;

//   protected constructor(table: TableRef, name: string) {
//     this.table = table;
//     this.name = name;
//   }

//   public abstract get dataType(): TDataType;
//   public abstract get isOptional(): TOptional;
//   public abstract get permissions(): FieldPermissions | undefined;
//   public abstract get comment(): string | undefined;

//   public toSurrealQL(): SurrealQL<TValue> {
//     const parts: SurrealQL[] = [];
//     parts.push(this.buildDefineClause());
//     parts.push(...this.buildSpecificClauses());

//     const permsClause = this.buildPermissionsClause();
//     if (permsClause) {
//       parts.push(permsClause);
//     }

//     const commentClause = this.buildCommentClause();
//     if (commentClause) {
//       parts.push(commentClause);
//     }

//     return surql.join(parts, surql.raw('')) as SurrealQL<TValue>;
//   }

//   protected abstract buildSpecificClauses(): SurrealQL[];

//   protected buildDefineClause(): SurrealQL {
//     return surql`DEFINE FIELD ${new Identifier(this.name)} ON TABLE ${new Identifier(this.table.tableName)}`;
//   }

//   protected buildPermissionsClause(): SurrealQL | null {
//     const perms = this.permissions;
//     if (!perms) {
//       return null;
//     }

//     const { select, create, update } = perms;

//     if (select === 'NONE' && create === 'NONE' && update === 'NONE') {
//       return surql.raw(' PERMISSIONS NONE');
//     }

//     if (select === 'FULL' && create === 'FULL' && update === 'FULL') {
//       return surql.raw(' PERMISSIONS FULL');
//     }

//     const clauses: string[] = [];
//     if (select) {
//       clauses.push(this.formatPermission('select', select));
//     }
//     if (create) {
//       clauses.push(this.formatPermission('create', create));
//     }
//     if (update) {
//       clauses.push(this.formatPermission('update', update));
//     }

//     return clauses.length > 0 ? surql.raw(` PERMISSIONS ${clauses.join(' ')}`) : null;
//   }

//   private formatPermission(action: string, permission: FieldPermission): string {
//     return `FOR ${action} ${permission}`;
//   }

//   protected buildCommentClause(): SurrealQL | null {
//     if (!this.comment) {
//       return null;
//     }
//     return surql.raw(` COMMENT "${this.comment.replace(/"/g, '\\"')}"`);
//   }
// }

// export class RegularField<
//   TDataType extends string = string,
//   TValue = ParseDataType<TDataType>,
//   TOptional extends boolean = false
// > extends Field<TDataType, TValue, TOptional> {
//   public static override readonly [ENTITY_KIND]: string = 'RegularField';

//   public declare readonly _: $Field<TDataType, TValue, TOptional>;

//   private readonly config: RegularFieldConfig<TDataType>;

//   public constructor(table: TableRef, name: string, config: RegularFieldConfig<TDataType>) {
//     super(table, name);
//     this.config = config;
//   }

//   public get dataType(): TDataType {
//     return this.config.dataType;
//   }

//   public get isOptional(): TOptional {
//     return this.config.dataType.startsWith('option<') as TOptional;
//   }

//   public get permissions(): FieldPermissions | undefined {
//     return this.config.permissions;
//   }

//   public get comment(): string | undefined {
//     return this.config.comment;
//   }

//   public get isFlexible(): boolean {
//     return this.config.flexible ?? false;
//   }

//   public get isReadonly(): boolean {
//     return this.config.readonly ?? false;
//   }

//   public get defaultValue(): string | undefined {
//     return this.config.default;
//   }

//   public get valueExpression(): string | undefined {
//     return this.config.value;
//   }

//   public get assertExpression(): string | undefined {
//     return this.config.assert;
//   }

//   public get referenceOnDelete(): OnDeleteBehavior | undefined {
//     return this.config.reference;
//   }

//   protected buildSpecificClauses(): SurrealQL[] {
//     const clauses: SurrealQL[] = [];

//     clauses.push(
//       surql.raw(` ${this.config.flexible ? 'FLEXIBLE TYPE' : 'TYPE'} ${this.config.dataType}`)
//     );

//     if (this.config.reference) {
//       clauses.push(surql.raw(` REFERENCE ON DELETE ${this.config.reference}`));
//     }

//     if (this.config.default !== undefined) {
//       clauses.push(
//         surql.raw(
//           ` ${this.config.defaultAlways ? 'DEFAULT ALWAYS' : 'DEFAULT'} ${this.config.default}`
//         )
//       );
//     }

//     if (this.config.readonly) {
//       clauses.push(surql.raw(' READONLY'));
//     }

//     if (this.config.value) {
//       clauses.push(surql.raw(` VALUE ${this.config.value}`));
//     }

//     if (this.config.assert) {
//       clauses.push(surql.raw(` ASSERT ${this.config.assert}`));
//     }

//     return clauses;
//   }
// }

// export class ComputedField<
//   TDataType extends string = string,
//   TValue = ParseDataType<TDataType>
// > extends Field<TDataType, TValue, false> {
//   public static override readonly [ENTITY_KIND]: string = 'ComputedField';

//   public declare readonly _: $Field<TDataType, TValue, false>;

//   private readonly config: ComputedFieldConfig<TDataType>;

//   public constructor(table: TableRef, name: string, config: ComputedFieldConfig<TDataType>) {
//     super(table, name);
//     this.config = config;
//   }

//   public get dataType(): TDataType {
//     return (this.config.dataType ?? 'any') as TDataType;
//   }

//   public get isOptional(): false {
//     return false;
//   }

//   public get permissions(): FieldPermissions | undefined {
//     return this.config.permissions;
//   }

//   public get comment(): string | undefined {
//     return this.config.comment;
//   }

//   public get expression(): string {
//     return this.config.expression;
//   }

//   public get hasExplicitType(): boolean {
//     return this.config.dataType !== undefined;
//   }

//   protected buildSpecificClauses(): SurrealQL[] {
//     const clauses: SurrealQL[] = [surql.raw(` VALUE ${this.config.expression}`)];

//     if (this.config.dataType) {
//       clauses.push(surql.raw(` TYPE ${this.config.dataType}`));
//     }

//     return clauses;
//   }
// }

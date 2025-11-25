import { ENTITY_KIND } from '../entity';
import type { SurrealQL } from '../expression';
import type { ParseFieldType } from '../types';
import { ComputedField } from './field';
import type {
  $Field,
  ComputedExpr,
  ComputedFieldBuilderConfig,
  FieldPermissions,
  TableRef
} from './types';

function exprToString<T>(expr: string | SurrealQL<T>): string {
  if (typeof expr === 'string') {
    return expr;
  }
  return expr.toQuery().query;
}

export class ComputedFieldBuilder<TType extends string = 'any', TValue = ParseFieldType<TType>> {
  public static readonly [ENTITY_KIND]: string = 'ComputedFieldBuilder';

  public declare readonly _: $Field<TType, TValue, false>;

  private readonly config: ComputedFieldBuilderConfig<TType, TValue>;

  public constructor(
    expression: ComputedExpr<TValue>,
    config?: Partial<Omit<ComputedFieldBuilderConfig<TType, TValue>, 'expression'>>
  ) {
    this.config = { expression, ...config };
  }

  public get dbType(): TType {
    return (this.config.type ?? 'any') as TType;
  }

  public get expression(): ComputedExpr<TValue> {
    return this.config.expression;
  }

  public build<TTable extends TableRef>(table: TTable, name: string): ComputedField<TType, TValue> {
    return new ComputedField<TType, TValue>(table, name, {
      type: this.config.type,
      permissions: this.config.permissions,
      comment: this.config.comment,
      expression: exprToString(this.config.expression)
    });
  }

  public type<TNewType extends string>(
    typeString: TNewType
  ): ComputedFieldBuilder<TNewType, ParseFieldType<TNewType>> {
    return new ComputedFieldBuilder<TNewType, ParseFieldType<TNewType>>(
      exprToString(this.config.expression),
      {
        type: typeString,
        permissions: this.config.permissions,
        comment: this.config.comment
      }
    );
  }

  public $type<TNewValue>(): ComputedFieldBuilder<TType, TNewValue> {
    return this as unknown as ComputedFieldBuilder<TType, TNewValue>;
  }

  public permissions(perms: FieldPermissions): ComputedFieldBuilder<TType, TValue> {
    return new ComputedFieldBuilder<TType, TValue>(this.config.expression, {
      ...this.config,
      permissions: perms
    });
  }

  public comment(text: string): ComputedFieldBuilder<TType, TValue> {
    return new ComputedFieldBuilder<TType, TValue>(this.config.expression, {
      ...this.config,
      comment: text
    });
  }
}

import { ENTITY_KIND } from '../entity';
import { isSQLConvertible, type SurrealQL } from '../expression';
import type { ParseFieldType } from '../types';
import { RegularField } from './field';
import type {
  $Field,
  AssertExpr,
  DefaultExpr,
  FieldPermissions,
  OnDeleteBehavior,
  RegularFieldBuilderConfig,
  TableRef,
  ValueExpr
} from './types';

type OptionalType<T extends string> = `option<${T}>`;

function valueToSurrealQL(value: unknown): string {
  if (value === null) {
    return 'NONE';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) {
    return `d'${value.toISOString()}'`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(valueToSurrealQL).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${valueToSurrealQL(v)}`)
      .join(', ');
    return `{ ${entries} }`;
  }
  return String(value);
}

function defaultExprToString<T>(expr: DefaultExpr<T>): string {
  if (typeof expr === 'string') {
    return expr;
  }
  if (isSQLConvertible(expr)) {
    return expr.toSurrealQL().toQuery().query;
  }
  return valueToSurrealQL(expr);
}

function exprToString<T>(expr: string | SurrealQL<T>): string {
  if (typeof expr === 'string') {
    return expr;
  }
  return expr.toQuery().query;
}

export class RegularFieldBuilder<
  TType extends string = string,
  TValue = ParseFieldType<TType>,
  TOptional extends boolean = false,
  TReadonly extends boolean = false
> {
  public static readonly [ENTITY_KIND]: string = 'RegularFieldBuilder';

  public declare readonly _: $Field<TType, TValue, TOptional, TReadonly>;

  private readonly config: RegularFieldBuilderConfig<TType, TValue>;

  public constructor(
    type: TType,
    config?: Partial<Omit<RegularFieldBuilderConfig<TType, TValue>, 'type'>>
  ) {
    this.config = { type, ...config };
  }

  public get dbType(): TType {
    return this.config.type;
  }

  public build<TTable extends TableRef>(
    table: TTable,
    name: string
  ): RegularField<TType, TOptional> {
    return new RegularField<TType, TOptional>(table, name, {
      type: this.config.type,
      flexible: this.config.flexible,
      readonly: this.config.readonly,
      defaultAlways: this.config.defaultAlways,
      reference: this.config.reference,
      permissions: this.config.permissions,
      comment: this.config.comment,
      default:
        this.config.default !== undefined ? defaultExprToString(this.config.default) : undefined,
      value: this.config.value !== undefined ? exprToString(this.config.value) : undefined,
      assert: this.config.assert !== undefined ? exprToString(this.config.assert) : undefined
    });
  }

  public optional(): RegularFieldBuilder<
    OptionalType<TType>,
    ParseFieldType<OptionalType<TType>>,
    true,
    TReadonly
  > {
    const newType = `option<${this.config.type}>` as OptionalType<TType>;
    return new RegularFieldBuilder<
      OptionalType<TType>,
      ParseFieldType<OptionalType<TType>>,
      true,
      TReadonly
    >(newType, this.config as never);
  }

  public $type<TNewValue>(): RegularFieldBuilder<TType, TNewValue, TOptional, TReadonly> {
    return this as never;
  }

  public flexible(): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      flexible: true
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public readonly(): RegularFieldBuilder<TType, TValue, TOptional, true> {
    return new RegularFieldBuilder<TType, TValue, TOptional, true>(this.config.type, {
      ...this.config,
      readonly: true
    }) as RegularFieldBuilder<TType, TValue, TOptional, true>;
  }

  public default(
    expression: DefaultExpr<TValue>
  ): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      default: expression,
      defaultAlways: false
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public defaultAlways(
    expression: DefaultExpr<TValue>
  ): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      default: expression,
      defaultAlways: true
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public value(
    expression: ValueExpr<TValue>
  ): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      value: expression
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public assert(expression: AssertExpr): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      assert: expression
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public reference<TBehavior extends OnDeleteBehavior>(
    behavior: TBehavior
  ): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      reference: behavior
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public permissions(
    perms: FieldPermissions
  ): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      permissions: perms
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }

  public comment(text: string): RegularFieldBuilder<TType, TValue, TOptional, TReadonly> {
    return new RegularFieldBuilder<TType, TValue, TOptional, TReadonly>(this.config.type, {
      ...this.config,
      comment: text
    }) as RegularFieldBuilder<TType, TValue, TOptional, TReadonly>;
  }
}

import { ENTITY_KIND } from '../entity';

/**
 * An identifier for a SurrealQL query.
 * @param value - The value of the identifier.
 */
export class Identifier {
  public static readonly [ENTITY_KIND] = 'identifier';

  private readonly _value: string;

  public constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }
}

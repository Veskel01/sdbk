import { ENTITY_KIND } from '../entity';

/**
 * An encoder for a SurrealQL parameter.
 * @param value - The value to encode.
 * @returns The encoded value.
 */
export interface Encoder {
  mapToDriverValue(value: unknown): unknown;
}

/**
 * A parameter for a SurrealQL query.
 * @param value - The value to encode.
 * @param encoder - The encoder to use.
 * @returns The encoded value.
 */
export class Parameter {
  public static readonly [ENTITY_KIND] = 'param';

  public static readonly TOKEN = '$' as const;

  private readonly _value: unknown;
  private readonly _encoder?: Encoder;

  public constructor(value: unknown, encoder?: Encoder) {
    this._value = value;
    this._encoder = encoder;
  }

  /**
   * Gets the driver value for the parameter.
   * @returns The driver value.
   */
  public getDriverValue(): unknown {
    return this._encoder?.mapToDriverValue(this._value) ?? this._value;
  }
}

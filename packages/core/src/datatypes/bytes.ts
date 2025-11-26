import type { Bytes } from '@sdbk/parser';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB bytes/binary value implementation.
 *
 * @example
 * ```typescript
 * const b = bytes(new Uint8Array([1, 2, 3]));
 * b.toSurql(); // "encoding::base64::decode('AQID')"
 * ```
 */
export class BytesImpl implements Bytes, SurqlSerializable {
  public readonly value: Uint8Array;
  public readonly __brand = 'Bytes' as const;

  public constructor(value: Uint8Array | ArrayBuffer) {
    this.value = value instanceof Uint8Array ? value : new Uint8Array(value);
  }

  public toBase64(): string {
    if (typeof btoa === 'function') {
      return btoa(String.fromCharCode(...this.value));
    }
    return Buffer.from(this.value).toString('base64');
  }

  public toSurql(): string {
    return `encoding::base64::decode('${this.toBase64()}')`;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB bytes value.
 *
 * @param value - Binary data as Uint8Array or ArrayBuffer
 * @returns Bytes instance
 *
 * @example
 * ```typescript
 * bytes(new Uint8Array([1, 2, 3]))
 * bytes(someArrayBuffer)
 * ```
 */
export function bytes(value: Uint8Array | ArrayBuffer): BytesImpl {
  return new BytesImpl(value);
}

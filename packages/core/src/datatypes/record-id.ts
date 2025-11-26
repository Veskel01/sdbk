import type { RecordId } from '@sdbk/parser';
import { BRAND, CHAR, IDENTIFIER_REGEX } from '../constants';
import type { SurqlSerializable } from './interfaces';

/**
 * SurrealDB record ID implementation.
 *
 * @example
 * ```typescript
 * const id = recordId('user', 'john');
 * id.toSurql(); // 'user:john'
 * ```
 */
export class RecordIdImpl<TTable extends string = string>
  implements RecordId<TTable>, SurqlSerializable
{
  public readonly table: TTable;
  public readonly id: string | number | object;
  public readonly __brand = BRAND.RECORD_ID;

  public constructor(table: TTable, id: string | number | object) {
    this.table = table;
    this.id = id;
  }

  public toSurql(): string {
    if (typeof this.id === 'string') {
      if (IDENTIFIER_REGEX.test(this.id)) {
        return `${this.table}${CHAR.SEPARATOR}${this.id}`;
      }
      return `${this.table}${CHAR.SEPARATOR}${CHAR.L_BRACKET}${this.id}${CHAR.R_BRACKET}`;
    }
    if (typeof this.id === 'number') {
      return `${this.table}${CHAR.SEPARATOR}${this.id}`;
    }
    return `${this.table}${CHAR.SEPARATOR}${JSON.stringify(this.id)}`;
  }

  public toString(): string {
    return this.toSurql();
  }
}

/**
 * Creates a SurrealDB record ID.
 *
 * @param table - Table name
 * @param id - Record identifier (string, number, or object)
 * @returns RecordId instance
 *
 * @example
 * ```typescript
 * recordId('user', 'john')      // user:john
 * recordId('user', 123)         // user:123
 * recordId('user', { id: 1 })   // user:{"id":1}
 * ```
 */
export function recordId<TTable extends string>(
  table: TTable,
  id: string | number | object
): RecordIdImpl<TTable> {
  return new RecordIdImpl(table, id);
}

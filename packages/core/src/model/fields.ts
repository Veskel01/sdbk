import { constructRegularField } from './builders';
import type { FieldName } from './schema';

// TODO -add more factory functions for other data types

export function string<T extends FieldName>(name: T) {
  return constructRegularField(name, 'string', {
    mapToDatabaseValue: (v) => `"${v}"`
  });
}

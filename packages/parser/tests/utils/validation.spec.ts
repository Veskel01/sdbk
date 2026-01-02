import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseErrors, ParseStatement } from '../../src';
import type { IsValidFieldName, IsValidTableName } from '../../src/utils/validation';

describe('IsValidTableName', () => {
  it('accepts valid table names', () => {
    expectTypeOf<IsValidTableName<'user'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidTableName<'user_profile'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidTableName<'user123'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidTableName<'User'>>().toEqualTypeOf<true>();
  });

  it('rejects empty names', () => {
    expectTypeOf<IsValidTableName<''>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'   '>>().toEqualTypeOf<false>();
  });

  it('rejects names starting with digits', () => {
    expectTypeOf<IsValidTableName<'123user'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'0table'>>().toEqualTypeOf<false>();
  });

  it('rejects names with invalid characters', () => {
    expectTypeOf<IsValidTableName<'user name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user.name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user,name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user;name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user(name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user)name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user[name'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidTableName<'user]name'>>().toEqualTypeOf<false>();
  });
});

describe('IsValidFieldName', () => {
  it('accepts valid field names', () => {
    expectTypeOf<IsValidFieldName<'email'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'user_id'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'createdAt'>>().toEqualTypeOf<true>();
  });

  it('accepts nested field names with dots', () => {
    expectTypeOf<IsValidFieldName<'emails.address'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'address.city'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'time.created_at'>>().toEqualTypeOf<true>();
  });

  it('accepts wildcard field names for array elements', () => {
    expectTypeOf<IsValidFieldName<'addresses.*'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'addresses.*.city'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'addresses.*.coordinates'>>().toEqualTypeOf<true>();
    expectTypeOf<IsValidFieldName<'items.*.name'>>().toEqualTypeOf<true>();
  });

  it('rejects invalid field names', () => {
    expectTypeOf<IsValidFieldName<''>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidFieldName<'123field'>>().toEqualTypeOf<false>();
    expectTypeOf<IsValidFieldName<'field name'>>().toEqualTypeOf<false>();
  });
});

describe('Validation in ParseStatement', () => {
  it('returns error for invalid table name', () => {
    type Result = ParseStatement<'DEFINE TABLE 123user'>;
    expectTypeOf<Result>().toExtend<ParseErrors.InvalidTableName>();
  });

  it('parses table name and treats rest as options', () => {
    // "user table" is parsed as table name "user" with "table" treated as an option
    type Result = ParseStatement<'DEFINE TABLE user table'>;
    expectTypeOf<Result>().toExtend<{ kind: 'table'; name: 'user' }>();
  });

  it('returns error for invalid field name', () => {
    type Result = ParseStatement<'DEFINE FIELD 123name ON user TYPE string'>;
    expectTypeOf<Result>().toExtend<ParseErrors.InvalidFieldName>();
  });

  it('accepts valid table and field names', () => {
    type Result = ParseStatement<'DEFINE TABLE user'>;
    expectTypeOf<Result>().toExtend<{ kind: 'table'; name: 'user' }>();

    type FieldResult = ParseStatement<'DEFINE FIELD email ON user TYPE string'>;
    expectTypeOf<FieldResult>().toExtend<{ kind: 'field'; name: 'email' }>();
  });
});

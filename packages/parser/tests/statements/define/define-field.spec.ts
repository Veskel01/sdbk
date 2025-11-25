import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE FIELD', () => {
  describe('Basic field definitions', () => {
    it('parses basic field with type', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD name ON user TYPE string
      `>;

      expectTypeOf<schema['tables']['user']['fields']['name']>().toExtend<{
        name: 'name';
        type: string;
      }>();
    });

    it('extracts multiple fields with different types', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user SCHEMAFULL;
        DEFINE FIELD name ON user TYPE string;
        DEFINE FIELD age ON user TYPE int;
        DEFINE FIELD active ON user TYPE bool
      `>;

      type UserFields = schema['tables']['user']['fields'];

      expectTypeOf<UserFields['name']['type']>().toEqualTypeOf<string>();
      expectTypeOf<UserFields['age']['type']>().toEqualTypeOf<number>();
      expectTypeOf<UserFields['active']['type']>().toEqualTypeOf<boolean>();
    });
  });

  describe('Modifiers', () => {
    it('parses field with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD OVERWRITE email ON user TYPE string
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['email']['overwrite']
      >().toEqualTypeOf<true>();
      expectTypeOf<
        Schema['tables']['user']['fields']['email']['ifNotExists']
      >().toEqualTypeOf<false>();
    });

    it('parses field with IF NOT EXISTS', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD IF NOT EXISTS email ON user TYPE string
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['email']['overwrite']
      >().toEqualTypeOf<false>();
      expectTypeOf<
        Schema['tables']['user']['fields']['email']['ifNotExists']
      >().toEqualTypeOf<true>();
    });

    it('parses field with READONLY', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD id ON user TYPE string READONLY
      `>;

      expectTypeOf<schema['tables']['user']['fields']['id']['readonly']>().toEqualTypeOf<true>();
    });
  });

  describe('Type variations', () => {
    it('parses array types', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD tags ON user TYPE array<string>
      `>;

      expectTypeOf<schema['tables']['user']['fields']['tags']['type']>().toEqualTypeOf<string[]>();
    });

    it('parses option types', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user TYPE option<string>
      `>;

      expectTypeOf<schema['tables']['user']['fields']['email']['type']>().toEqualTypeOf<
        string | null
      >();
    });

    it('parses set types', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD roles ON user TYPE set<string>
      `>;

      expectTypeOf<schema['tables']['user']['fields']['roles']['type']>().toEqualTypeOf<
        Set<string>
      >();
    });

    it('parses record types', () => {
      type schema = ParseSchema<`
        DEFINE TABLE post;
        DEFINE FIELD author ON post TYPE record<user>
      `>;

      expectTypeOf<schema['tables']['post']['fields']['author']['type']>().toExtend<{
        readonly __table: 'user';
        readonly __id: string;
      }>();
    });

    it('parses FLEXIBLE type', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD metadata ON user FLEXIBLE TYPE object
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['metadata']['flexible']
      >().toEqualTypeOf<true>();
    });
  });

  describe('Default values', () => {
    it('parses field with DEFAULT', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD locked ON user TYPE bool DEFAULT false
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['locked']['default']
      >().toEqualTypeOf<'false'>();
      expectTypeOf<
        Schema['tables']['user']['fields']['locked']['defaultAlways']
      >().toEqualTypeOf<false>();
    });

    it('parses field with DEFAULT ALWAYS', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE product;
        DEFINE FIELD primary ON product TYPE number DEFAULT ALWAYS 123.456
      `>;

      expectTypeOf<
        Schema['tables']['product']['fields']['primary']['default']
      >().toEqualTypeOf<'123.456'>();
      expectTypeOf<
        Schema['tables']['product']['fields']['primary']['defaultAlways']
      >().toEqualTypeOf<true>();
    });

    it('parses DEFAULT with string value', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD status ON user TYPE string DEFAULT "active"
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['status']['default']
      >().toEqualTypeOf<'"active"'>();
    });

    it('parses DEFAULT with number value', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE product;
        DEFINE FIELD stock ON product TYPE int DEFAULT 0
      `>;

      expectTypeOf<
        Schema['tables']['product']['fields']['stock']['default']
      >().toEqualTypeOf<'0'>();
    });
  });

  describe('Value and Assert clauses', () => {
    it('parses field with VALUE clause', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user TYPE string VALUE string::lowercase($value)
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['email']['value']
      >().toEqualTypeOf<'string::lowercase($value)'>();
    });

    it('parses field with ASSERT clause', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user TYPE string ASSERT string::is_email($value)
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['email']['assert']
      >().toEqualTypeOf<'string::is_email($value)'>();
    });

    it('parses field with both VALUE and ASSERT', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user TYPE string VALUE string::lowercase($value) ASSERT string::is_email($value)
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['email']['value']
      >().toEqualTypeOf<'string::lowercase($value)'>();
      expectTypeOf<
        Schema['tables']['user']['fields']['email']['assert']
      >().toEqualTypeOf<'string::is_email($value)'>();
    });
  });

  describe('References', () => {
    it('parses field with REFERENCE ON DELETE REJECT', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE post;
        DEFINE FIELD author ON post TYPE record<user> REFERENCE ON DELETE REJECT
      `>;

      expectTypeOf<Schema['tables']['post']['fields']['author']['reference']>().toEqualTypeOf<{
        onDelete: 'REJECT';
      }>();
    });

    it('parses field with REFERENCE ON DELETE CASCADE', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE comment;
        DEFINE FIELD post ON comment TYPE record<post> REFERENCE ON DELETE CASCADE
      `>;

      expectTypeOf<Schema['tables']['comment']['fields']['post']['reference']>().toEqualTypeOf<{
        onDelete: 'CASCADE';
      }>();
    });

    it('parses field with REFERENCE ON DELETE IGNORE', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE log;
        DEFINE FIELD user ON log TYPE record<user> REFERENCE ON DELETE IGNORE
      `>;

      expectTypeOf<Schema['tables']['log']['fields']['user']['reference']>().toEqualTypeOf<{
        onDelete: 'IGNORE';
      }>();
    });

    it('parses field with REFERENCE ON DELETE UNSET', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE task;
        DEFINE FIELD assignee ON task TYPE option<record<user>> REFERENCE ON DELETE UNSET
      `>;

      expectTypeOf<Schema['tables']['task']['fields']['assignee']['reference']>().toEqualTypeOf<{
        onDelete: 'UNSET';
      }>();
    });
  });

  describe('Permissions', () => {
    it('parses field with PERMISSIONS FULL', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD name ON user TYPE string PERMISSIONS FULL
      `>;

      expectTypeOf<Schema['tables']['user']['fields']['name']['permissions']>().toExtend<{
        full: true;
        none: false;
      }>();
    });

    it('parses field with PERMISSIONS NONE', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD internal_id ON user TYPE string PERMISSIONS NONE
      `>;

      expectTypeOf<Schema['tables']['user']['fields']['internal_id']['permissions']>().toExtend<{
        full: false;
        none: true;
      }>();
    });

    it('parses field with PERMISSIONS FOR clauses', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user PERMISSIONS FOR select WHERE published=true FOR update WHERE user=$auth.id
      `>;

      type Perms = Schema['tables']['user']['fields']['email']['permissions'];
      expectTypeOf<Perms>().toExtend<{ full: false; none: false }>();
    });
  });

  describe('Computed fields', () => {
    it('parses COMPUTED field', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD accessed_at ON user COMPUTED time::now()
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['accessed_at']['computed']
      >().toEqualTypeOf<'time::now()'>();
    });

    it('parses COMPUTED field with TYPE', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD full_name ON user COMPUTED first_name + ' ' + last_name TYPE string
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['full_name']['computed']
      >().toEqualTypeOf<"first_name + ' ' + last_name">();
      expectTypeOf<
        Schema['tables']['user']['fields']['full_name']['type']
      >().toEqualTypeOf<string>();
    });

    it('parses COMPUTED field with PERMISSIONS', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD age ON user COMPUTED time::now() - birth_date PERMISSIONS FULL
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['age']['computed']
      >().toEqualTypeOf<'time::now() - birth_date'>();
      expectTypeOf<Schema['tables']['user']['fields']['age']['permissions']>().toExtend<{
        full: true;
      }>();
    });

    it('parses COMPUTED field with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD OVERWRITE last_seen ON user COMPUTED time::now()
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['last_seen']['overwrite']
      >().toEqualTypeOf<true>();
      expectTypeOf<
        Schema['tables']['user']['fields']['last_seen']['computed']
      >().toEqualTypeOf<'time::now()'>();
    });
  });

  describe('Nested fields', () => {
    it('parses nested field definitions', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD emails.address ON user TYPE string;
        DEFINE FIELD emails.primary ON user TYPE bool
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['emails.address']['type']
      >().toEqualTypeOf<string>();
      expectTypeOf<
        Schema['tables']['user']['fields']['emails.primary']['type']
      >().toEqualTypeOf<boolean>();
    });

    it('parses deeply nested fields', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD address.street ON user TYPE string;
        DEFINE FIELD address.city ON user TYPE string;
        DEFINE FIELD address.country ON user TYPE string
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['address.street']['type']
      >().toEqualTypeOf<string>();
      expectTypeOf<
        Schema['tables']['user']['fields']['address.city']['type']
      >().toEqualTypeOf<string>();
    });
  });

  describe('Comments', () => {
    it('parses field with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user TYPE string COMMENT "User email address"
      `>;

      expectTypeOf<
        Schema['tables']['user']['fields']['email']['comment']
      >().toEqualTypeOf<'User email address'>();
    });
  });

  describe('Edge cases', () => {
    it('parses field with multiple clauses', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD OVERWRITE email ON TABLE user TYPE string VALUE string::lowercase($value) ASSERT string::is_email($value) READONLY COMMENT "Primary email"
      `>;

      type Field = Schema['tables']['user']['fields']['email'];
      expectTypeOf<Field['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Field['type']>().toEqualTypeOf<string>();
      expectTypeOf<Field['value']>().toEqualTypeOf<'string::lowercase($value)'>();
      expectTypeOf<Field['assert']>().toEqualTypeOf<'string::is_email($value)'>();
      expectTypeOf<Field['readonly']>().toEqualTypeOf<true>();
      expectTypeOf<Field['comment']>().toEqualTypeOf<'Primary email'>();
    });

    it('handles case insensitive keywords', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        define field name on user type string readonly
      `>;

      expectTypeOf<schema['tables']['user']['fields']['name']['readonly']>().toEqualTypeOf<true>();
    });

    it('handles field names with underscores', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD user_name ON user TYPE string
      `>;

      expectTypeOf<
        schema['tables']['user']['fields']['user_name']['name']
      >().toEqualTypeOf<'user_name'>();
    });

    it('handles optional TABLE keyword', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD name ON TABLE user TYPE string
      `>;

      expectTypeOf<schema['tables']['user']['fields']['name']['name']>().toEqualTypeOf<'name'>();
    });

    it('handles nested field names with dots', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD time.created_at ON user TYPE datetime
      `>;

      expectTypeOf<
        schema['tables']['user']['fields']['time.created_at']['name']
      >().toEqualTypeOf<'time.created_at'>();
      expectTypeOf<
        schema['tables']['user']['fields']['time.created_at']['type']
      >().toEqualTypeOf<Date>();
    });

    it('handles wildcard field names for array elements', () => {
      type schema = ParseSchema<`
        DEFINE TABLE address_history;
        DEFINE FIELD addresses ON address_history TYPE array<object>;
        DEFINE FIELD addresses.*.city ON address_history TYPE string;
        DEFINE FIELD addresses.*.coordinates ON address_history TYPE geometry<point>
      `>;

      expectTypeOf<
        schema['tables']['address_history']['fields']['addresses.*.city']['name']
      >().toEqualTypeOf<'addresses.*.city'>();
      expectTypeOf<
        schema['tables']['address_history']['fields']['addresses.*.city']['type']
      >().toEqualTypeOf<string>();
      expectTypeOf<
        schema['tables']['address_history']['fields']['addresses.*.coordinates']['name']
      >().toEqualTypeOf<'addresses.*.coordinates'>();
      expectTypeOf<
        schema['tables']['address_history']['fields']['addresses.*.coordinates']['type']
      >().toExtend<{ type: 'Point'; coordinates: [number, number] }>();
    });
  });

  describe('Literal types', () => {
    it('parses field with number literal union', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD level ON user TYPE 1 | 2 | 3
      `>;

      expectTypeOf<schema['tables']['user']['fields']['level']['type']>().toEqualTypeOf<
        1 | 2 | 3
      >();
      expectTypeOf<
        schema['tables']['user']['fields']['level']['dataType']
      >().toEqualTypeOf<'1 | 2 | 3'>();
    });

    it('parses field with string literal union', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD status ON user TYPE "active" | "inactive" | "pending"
      `>;

      expectTypeOf<schema['tables']['user']['fields']['status']['type']>().toEqualTypeOf<
        'active' | 'inactive' | 'pending'
      >();
    });

    it('parses field with mixed literal union', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD content ON user TYPE 9 | "9" | "nine"
      `>;

      expectTypeOf<schema['tables']['user']['fields']['content']['type']>().toEqualTypeOf<
        9 | '9' | 'nine'
      >();
    });

    it('parses field with type and literal union', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD value ON user TYPE datetime | uuid | "N/A"
      `>;

      expectTypeOf<schema['tables']['user']['fields']['value']['type']>().toEqualTypeOf<
        Date | string | 'N/A'
      >();
    });

    it('parses field with object literal', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD config ON user TYPE { enabled: bool, name: string }
      `>;

      expectTypeOf<schema['tables']['user']['fields']['config']['type']>().toEqualTypeOf<{
        enabled: boolean;
        name: string;
      }>();
    });

    it('parses field with union of object literals', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD result ON user TYPE { ok: bool } | { error: string }
      `>;

      expectTypeOf<schema['tables']['user']['fields']['result']['type']>().toEqualTypeOf<
        { ok: boolean } | { error: string }
      >();
    });

    it('parses multi-line object literal union (SurrealDB error_info pattern)', () => {
      type schema = ParseSchema<`
        DEFINE TABLE information;
        DEFINE FIELD error_info ON information TYPE
          { Continue: { message: string }} |
          { Retry: { after: duration }} |
          { Deprecated: { message: string }}
      `>;

      type ErrorInfo = schema['tables']['information']['fields']['error_info']['type'];
      expectTypeOf<ErrorInfo>().toExtend<
        | { Continue: { message: string } }
        | { Retry: { after: string } }
        | { Deprecated: { message: string } }
      >();
    });

    it('parses multi-line TYPE with tabs (exact user case)', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user SCHEMAFULL;
        DEFINE FIELD error_info ON TABLE user TYPE
	{ Continue:    { message: "" }} |
	{ Retry: { error: "Retrying", after: duration }} |
	{ Deprecated:  { message: string }};
      `>;

      type ErrorInfo = schema['tables']['user']['fields']['error_info'];

      // Check dataType is extracted
      expectTypeOf<ErrorInfo['dataType']>().not.toEqualTypeOf<undefined>();

      // Check type is not unknown
      expectTypeOf<ErrorInfo['type']>().not.toEqualTypeOf<unknown>();
    });

    it('parses object literal with nested types', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD meta ON user TYPE { tags: array<string>, owner: record<user> }
      `>;

      expectTypeOf<schema['tables']['user']['fields']['meta']['type']>().toExtend<{
        tags: string[];
        owner: { readonly __table: 'user'; readonly __id: string };
      }>();
    });
  });
});

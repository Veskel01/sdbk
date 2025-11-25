import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema, ParseStatement, ParseType, SplitStatements } from '../src';

// ============================================================================
// UTILITY TESTS
// ============================================================================

describe('SplitStatements', () => {
  it('splits by semicolon', () => {
    type result = SplitStatements<'DEFINE TABLE user; DEFINE FIELD name ON user'>;

    expectTypeOf<result>().toEqualTypeOf<['DEFINE TABLE user', 'DEFINE FIELD name ON user']>();
  });

  it('handles trailing semicolon', () => {
    type result = SplitStatements<'DEFINE TABLE user;'>;

    expectTypeOf<result>().toEqualTypeOf<['DEFINE TABLE user']>();
  });

  it('trims whitespace', () => {
    type result = SplitStatements<'  DEFINE TABLE user  ;  DEFINE FIELD name ON user  '>;

    expectTypeOf<result>().toEqualTypeOf<['DEFINE TABLE user', 'DEFINE FIELD name ON user']>();
  });
});

// ============================================================================
// PATTERN MATCHING TESTS
// ============================================================================

describe('ParseStatement', () => {
  it('parses DEFINE TABLE', () => {
    type result = ParseStatement<'DEFINE TABLE user'>;

    expectTypeOf<result>().toMatchTypeOf<{ kind: 'table'; name: 'user' }>();
  });

  it('parses DEFINE TABLE with SCHEMAFULL', () => {
    type result = ParseStatement<'DEFINE TABLE user SCHEMAFULL'>;

    expectTypeOf<result>().toMatchTypeOf<{
      kind: 'table';
      name: 'user';
      schemaMode: 'schemafull';
    }>();
  });

  it('parses DEFINE FIELD', () => {
    type result = ParseStatement<'DEFINE FIELD name ON user TYPE string'>;

    expectTypeOf<result>().toMatchTypeOf<{ kind: 'field'; name: 'name'; table: 'user' }>();
  });
});

describe('ParseType', () => {
  it('parses basic types', () => {
    expectTypeOf<ParseType<'string'>>().toEqualTypeOf<string>();
    expectTypeOf<ParseType<'int'>>().toEqualTypeOf<number>();
    expectTypeOf<ParseType<'bool'>>().toEqualTypeOf<boolean>();
    expectTypeOf<ParseType<'object'>>().toEqualTypeOf<Record<string, unknown>>();
  });

  it('parses array types', () => {
    expectTypeOf<ParseType<'array<string>'>>().toEqualTypeOf<string[]>();
  });

  it('parses option types', () => {
    expectTypeOf<ParseType<'option<string>'>>().toEqualTypeOf<string | null>();
  });
});

// ============================================================================
// SCHEMA EXTRACTION TESTS
// ============================================================================

describe('Schema Extraction', () => {
  it('extracts simple table schema', () => {
    type schema = ParseSchema<'DEFINE TABLE user'>;

    expectTypeOf<schema['tables']['user']>().toMatchTypeOf<{
      name: 'user';
      fields: Record<string, any>;
    }>();
    expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<schema['tables']['user']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts table with SCHEMAFULL', () => {
    type schema = ParseSchema<'DEFINE TABLE user SCHEMAFULL'>;

    expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemafull'>();
  });

  it('extracts table with SCHEMALESS', () => {
    type schema = ParseSchema<'DEFINE TABLE user SCHEMALESS'>;

    expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemaless'>();
  });

  it('extracts table with OVERWRITE', () => {
    type schema = ParseSchema<'DEFINE TABLE OVERWRITE user SCHEMAFULL'>;

    expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<schema['tables']['user']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts table with IF NOT EXISTS', () => {
    type schema = ParseSchema<'DEFINE TABLE IF NOT EXISTS user'>;

    expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<schema['tables']['user']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts table with DROP', () => {
    type schema = ParseSchema<'DEFINE TABLE reading DROP'>;

    expectTypeOf<schema['tables']['reading']['drop']>().toEqualTypeOf<true>();
  });

  it('extracts table with TYPE NORMAL', () => {
    type schema = ParseSchema<'DEFINE TABLE user TYPE NORMAL'>;

    expectTypeOf<schema['tables']['user']['tableType']>().toEqualTypeOf<'normal'>();
  });

  it('extracts table with TYPE ANY', () => {
    type schema = ParseSchema<'DEFINE TABLE data TYPE ANY'>;

    expectTypeOf<schema['tables']['data']['tableType']>().toEqualTypeOf<'any'>();
  });

  it('extracts table with TYPE RELATION', () => {
    type schema = ParseSchema<'DEFINE TABLE likes TYPE RELATION'>;

    expectTypeOf<schema['tables']['likes']['tableType']>().toEqualTypeOf<'relation'>();
  });

  it('extracts table with TYPE RELATION FROM TO', () => {
    type schema = ParseSchema<'DEFINE TABLE likes TYPE RELATION FROM user TO post'>;

    expectTypeOf<schema['tables']['likes']['tableType']>().toEqualTypeOf<'relation'>();
    expectTypeOf<schema['tables']['likes']['relationConfig']>().toMatchTypeOf<{
      from: 'user';
      to: 'post';
    }>();
  });

  it('extracts table with TYPE RELATION IN OUT', () => {
    type schema = ParseSchema<'DEFINE TABLE likes TYPE RELATION IN user OUT post'>;

    expectTypeOf<schema['tables']['likes']['relationConfig']>().toMatchTypeOf<{
      from: 'user';
      to: 'post';
    }>();
  });

  it('extracts table with TYPE RELATION ENFORCED', () => {
    type schema = ParseSchema<'DEFINE TABLE road_to TYPE RELATION IN city OUT city ENFORCED'>;

    expectTypeOf<schema['tables']['road_to']['relationConfig']>().toMatchTypeOf<{
      from: 'city';
      to: 'city';
      enforced: true;
    }>();
  });

  it('extracts table with CHANGEFEED', () => {
    type schema = ParseSchema<'DEFINE TABLE reading CHANGEFEED 3d'>;

    expectTypeOf<schema['tables']['reading']['changefeed']>().toMatchTypeOf<{
      duration: '3d';
      includeOriginal: false;
    }>();
  });

  it('extracts table with CHANGEFEED INCLUDE ORIGINAL', () => {
    type schema = ParseSchema<'DEFINE TABLE reading CHANGEFEED 7d INCLUDE ORIGINAL'>;

    expectTypeOf<schema['tables']['reading']['changefeed']>().toMatchTypeOf<{
      duration: '7d';
      includeOriginal: true;
    }>();
  });

  it('extracts table with PERMISSIONS NONE', () => {
    type schema = ParseSchema<'DEFINE TABLE secret PERMISSIONS NONE'>;

    expectTypeOf<schema['tables']['secret']['permissions']>().toMatchTypeOf<{
      none: true;
      full: false;
    }>();
  });

  it('extracts table with PERMISSIONS FULL', () => {
    type schema = ParseSchema<'DEFINE TABLE public PERMISSIONS FULL'>;

    expectTypeOf<schema['tables']['public']['permissions']>().toMatchTypeOf<{
      none: false;
      full: true;
    }>();
  });

  it('extracts table with COMMENT', () => {
    type schema = ParseSchema<'DEFINE TABLE user SCHEMAFULL COMMENT "User accounts"'>;

    expectTypeOf<schema['tables']['user']['comment']>().toEqualTypeOf<'User accounts'>();
  });

  it('extracts table with field', () => {
    type schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD name ON user TYPE string
    `>;

    expectTypeOf<schema['tables']['user']>().toMatchTypeOf<{
      name: 'user';
      schemaMode: 'schemafull';
      fields: {
        name: {
          name: 'name';
          type: string;
        };
      };
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

  it('extracts array types', () => {
    type schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD tags ON user TYPE array<string>
    `>;

    expectTypeOf<schema['tables']['user']['fields']['tags']['type']>().toEqualTypeOf<string[]>();
  });

  it('extracts option types', () => {
    type schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD email ON user TYPE option<string>
    `>;

    expectTypeOf<schema['tables']['user']['fields']['email']['type']>().toEqualTypeOf<
      string | null
    >();
  });

  it('handles readonly fields', () => {
    type schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD id ON user TYPE string READONLY
    `>;

    expectTypeOf<schema['tables']['user']['fields']['id']['readonly']>().toEqualTypeOf<true>();
  });

  it('extracts multiple tables', () => {
    type schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD name ON user TYPE string;
      DEFINE TABLE post;
      DEFINE FIELD title ON post TYPE string
    `>;

    // Check that both tables exist
    expectTypeOf<schema['tables']['user']['name']>().toEqualTypeOf<'user'>();
    expectTypeOf<schema['tables']['post']['name']>().toEqualTypeOf<'post'>();

    // Check fields
    expectTypeOf<schema['tables']['user']['fields']['name']['type']>().toEqualTypeOf<string>();
    expectTypeOf<schema['tables']['post']['fields']['title']['type']>().toEqualTypeOf<string>();
  });
});

// ============================================================================
// COMPLEX SCHEMA TESTS
// ============================================================================

describe('Complex Schema Extraction', () => {
  it('extracts realistic user schema', () => {
    type schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD username ON user TYPE string;
      DEFINE FIELD email ON user TYPE string;
      DEFINE FIELD age ON user TYPE int;
      DEFINE FIELD active ON user TYPE bool;
      DEFINE FIELD tags ON user TYPE array<string>;
      DEFINE FIELD metadata ON user TYPE object
    `>;

    type User = schema['tables']['user'];

    expectTypeOf<User['fields']['username']['type']>().toEqualTypeOf<string>();
    expectTypeOf<User['fields']['email']['type']>().toEqualTypeOf<string>();
    expectTypeOf<User['fields']['age']['type']>().toEqualTypeOf<number>();
    expectTypeOf<User['fields']['active']['type']>().toEqualTypeOf<boolean>();
    expectTypeOf<User['fields']['tags']['type']>().toEqualTypeOf<string[]>();
    expectTypeOf<User['fields']['metadata']['type']>().toEqualTypeOf<Record<string, unknown>>();
  });

  it('handles case insensitive keywords', () => {
    type schema = ParseSchema<`
      define table user schemafull;
      define field name on user type string
    `>;

    expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemafull'>();
    expectTypeOf<schema['tables']['user']['fields']['name']['type']>().toEqualTypeOf<string>();
  });
});

// ============================================================================
// ADVANCED SCHEMA TESTS
// ============================================================================

describe('Advanced Schema - User & Auth', () => {
  it('extracts user table with field modifiers', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE FIELD email ON user TYPE string;
      DEFINE FIELD name ON user TYPE option<string>;
      DEFINE FIELD active ON user TYPE bool
    `>;

    type User = Schema['tables']['user'];

    expectTypeOf<User['name']>().toEqualTypeOf<'user'>();
    expectTypeOf<User['schemaMode']>().toEqualTypeOf<'schemafull'>();
    expectTypeOf<User['fields']['id']['type']>().toEqualTypeOf<string>();
    expectTypeOf<User['fields']['id']['readonly']>().toEqualTypeOf<true>();
    expectTypeOf<User['fields']['email']['type']>().toEqualTypeOf<string>();
    expectTypeOf<User['fields']['name']['type']>().toEqualTypeOf<string | null>();
    expectTypeOf<User['fields']['active']['type']>().toEqualTypeOf<boolean>();
  });
});

// ============================================================================
// FIELD DEFINITION TESTS
// ============================================================================

describe('Field Definitions - Extended', () => {
  it('parses field with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD OVERWRITE email ON user TYPE string
    `>;

    expectTypeOf<Schema['tables']['user']['fields']['email']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<
      Schema['tables']['user']['fields']['email']['ifNotExists']
    >().toEqualTypeOf<false>();
  });

  it('parses field with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD IF NOT EXISTS email ON user TYPE string
    `>;

    expectTypeOf<Schema['tables']['user']['fields']['email']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<
      Schema['tables']['user']['fields']['email']['ifNotExists']
    >().toEqualTypeOf<true>();
  });

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

  it('parses field with FLEXIBLE type', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD metadata ON user FLEXIBLE TYPE object
    `>;

    expectTypeOf<
      Schema['tables']['user']['fields']['metadata']['flexible']
    >().toEqualTypeOf<true>();
  });

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

  it('parses field with PERMISSIONS FULL', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD name ON user TYPE string PERMISSIONS FULL
    `>;

    expectTypeOf<Schema['tables']['user']['fields']['name']['permissions']>().toMatchTypeOf<{
      full: true;
      none: false;
    }>();
  });

  it('parses field with PERMISSIONS NONE', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD internal_id ON user TYPE string PERMISSIONS NONE
    `>;

    expectTypeOf<Schema['tables']['user']['fields']['internal_id']['permissions']>().toMatchTypeOf<{
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
    expectTypeOf<Perms>().toMatchTypeOf<{ full: false; none: false }>();
  });

  it('parses field with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD email ON user TYPE string COMMENT "User email address"
    `>;

    expectTypeOf<
      Schema['tables']['user']['fields']['email']['comment']
    >().toEqualTypeOf<'User email address'>();
  });

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
    expectTypeOf<Schema['tables']['user']['fields']['full_name']['type']>().toEqualTypeOf<string>();
  });

  it('parses COMPUTED field with PERMISSIONS', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD age ON user COMPUTED time::now() - birth_date PERMISSIONS FULL
    `>;

    expectTypeOf<
      Schema['tables']['user']['fields']['age']['computed']
    >().toEqualTypeOf<'time::now() - birth_date'>();
    expectTypeOf<Schema['tables']['user']['fields']['age']['permissions']>().toMatchTypeOf<{
      full: true;
    }>();
  });

  it('parses COMPUTED field with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE FIELD is_adult ON user COMPUTED age >= 18 TYPE bool COMMENT "Computed adult status"
    `>;

    expectTypeOf<
      Schema['tables']['user']['fields']['is_adult']['computed']
    >().toEqualTypeOf<'age >= 18'>();
    expectTypeOf<
      Schema['tables']['user']['fields']['is_adult']['comment']
    >().toEqualTypeOf<'Computed adult status'>();
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

describe('Advanced Schema - Product Catalog', () => {
  it('extracts product with arrays and optional fields', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE product SCHEMAFULL;
      DEFINE FIELD id ON product TYPE string READONLY;
      DEFINE FIELD name ON product TYPE string;
      DEFINE FIELD description ON product TYPE option<string>;
      DEFINE FIELD price ON product TYPE decimal;
      DEFINE FIELD stock ON product TYPE int;
      DEFINE FIELD tags ON product TYPE array<string>;
      DEFINE FIELD images ON product TYPE array<string>;
      DEFINE FIELD is_active ON product TYPE bool
    `>;

    type Product = Schema['tables']['product'];

    expectTypeOf<Product['fields']['name']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Product['fields']['description']['type']>().toEqualTypeOf<string | null>();
    expectTypeOf<Product['fields']['price']['type']>().toEqualTypeOf<number>();
    expectTypeOf<Product['fields']['stock']['type']>().toEqualTypeOf<number>();
    expectTypeOf<Product['fields']['tags']['type']>().toEqualTypeOf<string[]>();
    expectTypeOf<Product['fields']['images']['type']>().toEqualTypeOf<string[]>();
    expectTypeOf<Product['fields']['is_active']['type']>().toEqualTypeOf<boolean>();
  });
});

describe('Advanced Schema - Multi-Table Relations', () => {
  it('extracts order system with related tables', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE order SCHEMAFULL;
      DEFINE FIELD user_id ON order TYPE string;
      DEFINE FIELD total ON order TYPE decimal;
      DEFINE FIELD address ON order TYPE object;

      DEFINE TABLE order_item SCHEMAFULL;
      DEFINE FIELD order_id ON order_item TYPE string;
      DEFINE FIELD quantity ON order_item TYPE int
    `>;

    // Order table
    type Order = Schema['tables']['order'];
    expectTypeOf<Order['name']>().toEqualTypeOf<'order'>();
    expectTypeOf<Order['fields']['user_id']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Order['fields']['total']['type']>().toEqualTypeOf<number>();
    expectTypeOf<Order['fields']['address']['type']>().toEqualTypeOf<Record<string, unknown>>();

    // Order item table
    type OrderItem = Schema['tables']['order_item'];
    expectTypeOf<OrderItem['name']>().toEqualTypeOf<'order_item'>();
    expectTypeOf<OrderItem['fields']['quantity']['type']>().toEqualTypeOf<number>();
  });
});

describe('Advanced Schema - Mixed Schema Modes', () => {
  it('handles schemafull and schemaless tables together', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE config SCHEMAFULL;
      DEFINE FIELD key ON config TYPE string;
      DEFINE FIELD value ON config TYPE string;

      DEFINE TABLE logs SCHEMALESS;
      DEFINE FIELD timestamp ON logs TYPE datetime;
      DEFINE FIELD level ON logs TYPE string;
      DEFINE FIELD message ON logs TYPE string
    `>;

    // Schemafull table
    type Config = Schema['tables']['config'];
    expectTypeOf<Config['schemaMode']>().toEqualTypeOf<'schemafull'>();
    expectTypeOf<Config['fields']['key']['type']>().toEqualTypeOf<string>();

    // Schemaless table
    type Logs = Schema['tables']['logs'];
    expectTypeOf<Logs['schemaMode']>().toEqualTypeOf<'schemaless'>();
    expectTypeOf<Logs['fields']['timestamp']['type']>().toEqualTypeOf<Date>();
    expectTypeOf<Logs['fields']['level']['type']>().toEqualTypeOf<string>();
  });
});

describe('Advanced Schema - All SurQL Types', () => {
  it('correctly maps all basic SurQL types to TypeScript', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE types_test SCHEMAFULL;
      DEFINE FIELD str ON types_test TYPE string;
      DEFINE FIELD num ON types_test TYPE int;
      DEFINE FIELD flt ON types_test TYPE float;
      DEFINE FIELD dec ON types_test TYPE decimal;
      DEFINE FIELD bl ON types_test TYPE bool;
      DEFINE FIELD dur ON types_test TYPE duration;
      DEFINE FIELD uid ON types_test TYPE uuid;
      DEFINE FIELD obj ON types_test TYPE object;
      DEFINE FIELD arr ON types_test TYPE array<string>;
      DEFINE FIELD opt ON types_test TYPE option<int>
    `>;

    type Test = Schema['tables']['types_test']['fields'];

    expectTypeOf<Test['str']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Test['num']['type']>().toEqualTypeOf<number>();
    expectTypeOf<Test['flt']['type']>().toEqualTypeOf<number>();
    expectTypeOf<Test['dec']['type']>().toEqualTypeOf<number>();
    expectTypeOf<Test['bl']['type']>().toEqualTypeOf<boolean>();
    expectTypeOf<Test['dur']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Test['uid']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Test['obj']['type']>().toEqualTypeOf<Record<string, unknown>>();
    expectTypeOf<Test['arr']['type']>().toEqualTypeOf<string[]>();
    expectTypeOf<Test['opt']['type']>().toEqualTypeOf<number | null>();
  });
});

// ============================================================================
// INDEX TESTS
// ============================================================================

describe('Index Definitions', () => {
  it('extracts basic index', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX idx_email ON user FIELDS email
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['name']>().toEqualTypeOf<'idx_email'>();
    expectTypeOf<Schema['indexes']['idx_email']['table']>().toEqualTypeOf<'user'>();
    expectTypeOf<Schema['indexes']['idx_email']['fields'][0]>().toEqualTypeOf<'email'>();
    expectTypeOf<Schema['indexes']['idx_email']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['indexes']['idx_email']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts unique index', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD email ON user TYPE string;
      DEFINE INDEX idx_email ON user FIELDS email UNIQUE
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['unique']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['indexes']['idx_email']['indexType']>().toEqualTypeOf<'unique'>();
  });

  it('extracts search index', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE article SCHEMAFULL;
      DEFINE FIELD content ON article TYPE string;
      DEFINE INDEX idx_content ON article FIELDS content SEARCH
    `>;

    expectTypeOf<Schema['indexes']['idx_content']['indexType']>().toEqualTypeOf<'search'>();
  });

  it('extracts index with OVERWRITE modifier', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX OVERWRITE idx_email ON user FIELDS email UNIQUE
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['indexes']['idx_email']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts index with IF NOT EXISTS modifier', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX IF NOT EXISTS idx_email ON user FIELDS email
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['indexes']['idx_email']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts index with optional TABLE keyword', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX idx_email ON TABLE user FIELDS email
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['table']>().toEqualTypeOf<'user'>();
  });

  it('extracts composite index with multiple fields', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX idx_composite ON user FIELDS account, email UNIQUE
    `>;

    expectTypeOf<Schema['indexes']['idx_composite']['fields']>().toEqualTypeOf<
      ['account', 'email']
    >();
    expectTypeOf<Schema['indexes']['idx_composite']['unique']>().toEqualTypeOf<true>();
  });

  it('extracts COUNT index', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE reading;
      DEFINE INDEX idx_count ON reading COUNT
    `>;

    expectTypeOf<Schema['indexes']['idx_count']['indexType']>().toEqualTypeOf<'count'>();
    expectTypeOf<Schema['indexes']['idx_count']['fields']>().toEqualTypeOf<[]>();
  });

  it('extracts FULLTEXT index with analyzer', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE article;
      DEFINE INDEX idx_content ON article FIELDS content FULLTEXT ANALYZER example_ascii
    `>;

    expectTypeOf<Schema['indexes']['idx_content']['indexType']>().toEqualTypeOf<'fulltext'>();
    expectTypeOf<Schema['indexes']['idx_content']['analyzer']>().toEqualTypeOf<'example_ascii'>();
  });

  it('extracts HNSW vector index', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE document;
      DEFINE INDEX idx_embedding ON document FIELDS embedding HNSW DIMENSION 4
    `>;

    expectTypeOf<Schema['indexes']['idx_embedding']['indexType']>().toEqualTypeOf<'hnsw'>();
    expectTypeOf<Schema['indexes']['idx_embedding']['hnswConfig']>().toMatchTypeOf<{
      dimension: 4;
    }>();
  });

  it('extracts HNSW index with TYPE', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE document;
      DEFINE INDEX idx_embedding ON document FIELDS embedding HNSW DIMENSION 4 TYPE I64
    `>;

    expectTypeOf<Schema['indexes']['idx_embedding']['hnswConfig']>().toMatchTypeOf<{
      dimension: 4;
      type: 'I64';
    }>();
  });

  it('extracts HNSW index with DIST', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE document;
      DEFINE INDEX idx_embedding ON document FIELDS embedding HNSW DIMENSION 128 DIST COSINE
    `>;

    expectTypeOf<Schema['indexes']['idx_embedding']['hnswConfig']>().toMatchTypeOf<{
      dimension: 128;
      dist: 'COSINE';
    }>();
  });

  it('extracts index with CONCURRENTLY', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX idx_email ON user FIELDS email CONCURRENTLY
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['concurrently']>().toEqualTypeOf<true>();
  });

  it('extracts index with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX idx_email ON user FIELDS email UNIQUE COMMENT "Email uniqueness"
    `>;

    expectTypeOf<Schema['indexes']['idx_email']['comment']>().toEqualTypeOf<'Email uniqueness'>();
  });

  it('extracts index using COLUMNS keyword', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user;
      DEFINE INDEX idx_age ON user COLUMNS age
    `>;

    expectTypeOf<Schema['indexes']['idx_age']['fields'][0]>().toEqualTypeOf<'age'>();
  });
});

// ============================================================================
// MODULE TESTS
// ============================================================================

describe('Module Definitions', () => {
  it('extracts basic module definition', () => {
    type Schema = ParseSchema<`
      DEFINE MODULE mod::test AS f"test:/demo.surli"
    `>;

    expectTypeOf<Schema['modules']['mod::test']['name']>().toEqualTypeOf<'mod::test'>();
    expectTypeOf<Schema['modules']['mod::test']['fileName']>().toEqualTypeOf<'test:/demo.surli'>();
    expectTypeOf<Schema['modules']['mod::test']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['modules']['mod::test']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts module with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE MODULE OVERWRITE mod::utils AS f"utils:/helper.surli"
    `>;

    expectTypeOf<Schema['modules']['mod::utils']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['modules']['mod::utils']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts module with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE MODULE IF NOT EXISTS mod::crypto AS f"crypto:/hash.surli"
    `>;

    expectTypeOf<Schema['modules']['mod::crypto']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['modules']['mod::crypto']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts module with double-quoted file name', () => {
    type Schema = ParseSchema<`
      DEFINE MODULE mod::auth AS "auth:/login.surli"
    `>;

    expectTypeOf<Schema['modules']['mod::auth']['fileName']>().toEqualTypeOf<'auth:/login.surli'>();
  });
});

// ============================================================================
// EVENT TESTS
// ============================================================================

describe('Event Definitions', () => {
  it('extracts event definition', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE EVENT user_created ON user
    `>;

    expectTypeOf<Schema['events']['user_created']>().toMatchTypeOf<{
      name: 'user_created';
      table: 'user';
    }>();
  });

  it('extracts multiple events', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE order SCHEMAFULL;
      DEFINE EVENT order_created ON order;
      DEFINE EVENT order_updated ON order;
      DEFINE EVENT order_deleted ON order
    `>;

    expectTypeOf<Schema['events']['order_created']['name']>().toEqualTypeOf<'order_created'>();
    expectTypeOf<Schema['events']['order_updated']['name']>().toEqualTypeOf<'order_updated'>();
    expectTypeOf<Schema['events']['order_deleted']['name']>().toEqualTypeOf<'order_deleted'>();
  });

  it('extracts event with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT OVERWRITE test ON user THEN {}
    `>;

    expectTypeOf<Schema['events']['test']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['events']['test']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts event with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT IF NOT EXISTS test ON user THEN {}
    `>;

    expectTypeOf<Schema['events']['test']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['events']['test']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts event with ON TABLE syntax', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT user_updated ON TABLE user THEN {}
    `>;

    expectTypeOf<Schema['events']['user_updated']['table']>().toEqualTypeOf<'user'>();
  });

  it('extracts event with WHEN clause', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT email_changed ON user WHEN $before.email != $after.email THEN {}
    `>;

    expectTypeOf<
      Schema['events']['email_changed']['when']
    >().toEqualTypeOf<'$before.email != $after.email'>();
  });

  it('extracts event with THEN clause', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT log_change ON user THEN (CREATE log SET user = $value.id)
    `>;

    expectTypeOf<
      Schema['events']['log_change']['then']
    >().toEqualTypeOf<'(CREATE log SET user = $value.id)'>();
  });

  it('extracts event with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT user_created ON user THEN {} COMMENT "Logs user creation"
    `>;

    expectTypeOf<
      Schema['events']['user_created']['comment']
    >().toEqualTypeOf<'Logs user creation'>();
  });

  it('extracts event with WHEN, THEN and COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT OVERWRITE email_update ON TABLE user WHEN $event = "UPDATE" THEN (CREATE log) COMMENT "Email update logger"
    `>;

    type Event = Schema['events']['email_update'];
    expectTypeOf<Event['name']>().toEqualTypeOf<'email_update'>();
    expectTypeOf<Event['table']>().toEqualTypeOf<'user'>();
    expectTypeOf<Event['when']>().toEqualTypeOf<'$event = "UPDATE"'>();
    expectTypeOf<Event['then']>().toEqualTypeOf<'(CREATE log)'>();
    expectTypeOf<Event['comment']>().toEqualTypeOf<'Email update logger'>();
    expectTypeOf<Event['overwrite']>().toEqualTypeOf<true>();
  });

  it('extracts event based on specific event type', () => {
    type Schema = ParseSchema<`
      DEFINE EVENT publish_post ON publish_post WHEN $event = "CREATE" THEN (UPDATE post SET status = "PUBLISHED" WHERE id = $after.post_id)
    `>;

    expectTypeOf<Schema['events']['publish_post']['when']>().toEqualTypeOf<'$event = "CREATE"'>();
  });
});

// ============================================================================
// ANALYZER TESTS
// ============================================================================

describe('Analyzer Definitions', () => {
  it('extracts basic analyzer with tokenizers', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER my_analyzer TOKENIZERS blank
    `>;

    expectTypeOf<Schema['analyzers']['my_analyzer']>().toMatchTypeOf<{
      name: 'my_analyzer';
      tokenizers: ['blank'];
    }>();
  });

  it('extracts analyzer with multiple tokenizers', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER code_analyzer TOKENIZERS class,camel
    `>;

    expectTypeOf<Schema['analyzers']['code_analyzer']['tokenizers']>().toEqualTypeOf<
      ['class', 'camel']
    >();
  });

  it('extracts analyzer with filters', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER ascii_analyzer TOKENIZERS class FILTERS lowercase,ascii
    `>;

    expectTypeOf<Schema['analyzers']['ascii_analyzer']['tokenizers']>().toEqualTypeOf<['class']>();
    expectTypeOf<Schema['analyzers']['ascii_analyzer']['filters']>().toEqualTypeOf<
      ['lowercase', 'ascii']
    >();
  });

  it('extracts analyzer with parameterized filters', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER ngram_analyzer TOKENIZERS class FILTERS ngram(1,3)
    `>;

    expectTypeOf<Schema['analyzers']['ngram_analyzer']['filters']>().toEqualTypeOf<
      ['ngram(1,3)']
    >();
  });

  it('extracts analyzer with snowball filter', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER english TOKENIZERS class FILTERS snowball(english)
    `>;

    expectTypeOf<Schema['analyzers']['english']['filters']>().toEqualTypeOf<
      ['snowball(english)']
    >();
  });

  it('extracts analyzer with FUNCTION clause', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER backwards FUNCTION fn::backwardsify TOKENIZERS blank
    `>;

    expectTypeOf<
      Schema['analyzers']['backwards']['function']
    >().toEqualTypeOf<'fn::backwardsify'>();
    expectTypeOf<Schema['analyzers']['backwards']['tokenizers']>().toEqualTypeOf<['blank']>();
  });

  it('extracts analyzer with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER OVERWRITE example TOKENIZERS blank
    `>;

    expectTypeOf<Schema['analyzers']['example']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['analyzers']['example']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts analyzer with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER IF NOT EXISTS example TOKENIZERS blank
    `>;

    expectTypeOf<Schema['analyzers']['example']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['analyzers']['example']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts analyzer with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER search TOKENIZERS blank COMMENT "Full text search analyzer"
    `>;

    expectTypeOf<
      Schema['analyzers']['search']['comment']
    >().toEqualTypeOf<'Full text search analyzer'>();
  });

  it('extracts complex analyzer with all options', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER OVERWRITE autocomplete TOKENIZERS blank,class FILTERS lowercase,edgengram(2,10) COMMENT "Autocomplete analyzer"
    `>;

    type Analyzer = Schema['analyzers']['autocomplete'];
    expectTypeOf<Analyzer['name']>().toEqualTypeOf<'autocomplete'>();
    expectTypeOf<Analyzer['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Analyzer['tokenizers']>().toEqualTypeOf<['blank', 'class']>();
    expectTypeOf<Analyzer['filters']>().toEqualTypeOf<['lowercase', 'edgengram(2,10)']>();
    expectTypeOf<Analyzer['comment']>().toEqualTypeOf<'Autocomplete analyzer'>();
  });
});

// ============================================================================
// FUNCTION TESTS
// ============================================================================

describe('Function Definitions', () => {
  it('extracts function definition', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::greet()
    `>;

    expectTypeOf<Schema['functions']['fn::greet']>().toMatchTypeOf<{
      name: 'fn::greet';
    }>();
  });

  it('extracts function with arguments', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::add($a, $b)
    `>;

    expectTypeOf<Schema['functions']['fn::add']['name']>().toEqualTypeOf<'fn::add'>();
  });

  it('extracts function with typed arguments', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::greet($name: string)
    `>;

    type Fn = Schema['functions']['fn::greet'];
    expectTypeOf<Fn['name']>().toEqualTypeOf<'fn::greet'>();
    expectTypeOf<Fn['params'][0]['name']>().toEqualTypeOf<'name'>();
    expectTypeOf<Fn['params'][0]['type']>().toEqualTypeOf<string>();
  });

  it('extracts function with multiple typed arguments', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::relation_exists($in: record, $tb: string, $out: record)
    `>;

    type Fn = Schema['functions']['fn::relation_exists'];
    expectTypeOf<Fn['params'][0]['name']>().toEqualTypeOf<'in'>();
    expectTypeOf<Fn['params'][1]['name']>().toEqualTypeOf<'tb'>();
    expectTypeOf<Fn['params'][1]['type']>().toEqualTypeOf<string>();
    expectTypeOf<Fn['params'][2]['name']>().toEqualTypeOf<'out'>();
  });

  it('extracts function with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION OVERWRITE fn::example()
    `>;

    expectTypeOf<Schema['functions']['fn::example']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['functions']['fn::example']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts function with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION IF NOT EXISTS fn::example()
    `>;

    expectTypeOf<Schema['functions']['fn::example']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['functions']['fn::example']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts function with body', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::greet($name: string) { RETURN "Hello, " + $name + "!"; }
    `>;

    type Fn = Schema['functions']['fn::greet'];
    expectTypeOf<Fn['body']>().toEqualTypeOf<'{ RETURN "Hello, " + $name + "!"; }'>();
  });

  it('extracts function with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::greet($name: string) { RETURN "Hello!"; } COMMENT "Greeting function"
    `>;

    expectTypeOf<
      Schema['functions']['fn::greet']['comment']
    >().toEqualTypeOf<'Greeting function'>();
  });

  it('extracts function with PERMISSIONS FULL', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::public_func() { RETURN true; } PERMISSIONS FULL
    `>;

    expectTypeOf<Schema['functions']['fn::public_func']['permissions']>().toEqualTypeOf<'FULL'>();
  });

  it('extracts function with PERMISSIONS NONE', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::admin_only() { RETURN true; } PERMISSIONS NONE
    `>;

    expectTypeOf<Schema['functions']['fn::admin_only']['permissions']>().toEqualTypeOf<'NONE'>();
  });

  it('extracts function with PERMISSIONS WHERE', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION fn::admin_func() { RETURN true; } PERMISSIONS WHERE $auth.admin = true
    `>;

    expectTypeOf<
      Schema['functions']['fn::admin_func']['permissions']
    >().toEqualTypeOf<'WHERE $auth.admin = true'>();
  });

  it('extracts full function definition', () => {
    type Schema = ParseSchema<`
      DEFINE FUNCTION OVERWRITE fn::fetchProducts() { RETURN (SELECT * FROM product); } COMMENT "Fetch all products" PERMISSIONS WHERE $auth.admin = true
    `>;

    type Fn = Schema['functions']['fn::fetchProducts'];
    expectTypeOf<Fn['name']>().toEqualTypeOf<'fn::fetchProducts'>();
    expectTypeOf<Fn['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Fn['comment']>().toEqualTypeOf<'Fetch all products'>();
  });
});

// ============================================================================
// PARAM TESTS
// ============================================================================

describe('Param Definitions', () => {
  it('extracts param definition', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $api_key
    `>;

    expectTypeOf<Schema['params']['api_key']>().toMatchTypeOf<{
      name: 'api_key';
    }>();
    expectTypeOf<Schema['params']['api_key']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['params']['api_key']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts multiple params', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $db_host;
      DEFINE PARAM $db_port;
      DEFINE PARAM $db_name
    `>;

    expectTypeOf<Schema['params']['db_host']['name']>().toEqualTypeOf<'db_host'>();
    expectTypeOf<Schema['params']['db_port']['name']>().toEqualTypeOf<'db_port'>();
    expectTypeOf<Schema['params']['db_name']['name']>().toEqualTypeOf<'db_name'>();
  });

  it('extracts param with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM OVERWRITE $example VALUE 123
    `>;

    expectTypeOf<Schema['params']['example']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['params']['example']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts param with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM IF NOT EXISTS $example VALUE 456
    `>;

    expectTypeOf<Schema['params']['example']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['params']['example']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts param with VALUE', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $endpointBase VALUE "https://dummyjson.com"
    `>;

    expectTypeOf<
      Schema['params']['endpointBase']['value']
    >().toEqualTypeOf<'"https://dummyjson.com"'>();
  });

  it('extracts param with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $api_url VALUE "https://api.example.com" COMMENT "API base URL"
    `>;

    expectTypeOf<Schema['params']['api_url']['comment']>().toEqualTypeOf<'API base URL'>();
  });

  it('extracts param with PERMISSIONS NONE', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $secret VALUE "hidden" PERMISSIONS NONE
    `>;

    expectTypeOf<Schema['params']['secret']['permissions']>().toEqualTypeOf<'none'>();
  });

  it('extracts param with PERMISSIONS FULL', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $public VALUE "visible" PERMISSIONS FULL
    `>;

    expectTypeOf<Schema['params']['public']['permissions']>().toEqualTypeOf<'full'>();
  });

  it('extracts param with PERMISSIONS WHERE', () => {
    type Schema = ParseSchema<`
      DEFINE PARAM $restricted VALUE "data" PERMISSIONS WHERE $auth.admin = true
    `>;

    expectTypeOf<
      Schema['params']['restricted']['permissions']
    >().toEqualTypeOf<'$auth.admin = true'>();
  });
});

// ============================================================================
// SEQUENCE TESTS
// ============================================================================

// ============================================================================
// USER TESTS
// ============================================================================

describe('User Definitions', () => {
  it('extracts basic user definition', () => {
    type Schema = ParseSchema<`
      DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER
    `>;

    expectTypeOf<Schema['users']['admin']['name']>().toEqualTypeOf<'admin'>();
    expectTypeOf<Schema['users']['admin']['level']>().toEqualTypeOf<'root'>();
    expectTypeOf<Schema['users']['admin']['roles']>().toEqualTypeOf<['OWNER']>();
    expectTypeOf<Schema['users']['admin']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['users']['admin']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts user with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE USER OVERWRITE admin ON ROOT PASSWORD "secret" ROLES OWNER
    `>;

    expectTypeOf<Schema['users']['admin']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['users']['admin']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts user with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE USER IF NOT EXISTS admin ON ROOT PASSWORD "secret" ROLES OWNER
    `>;

    expectTypeOf<Schema['users']['admin']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['users']['admin']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts user on NAMESPACE level', () => {
    type Schema = ParseSchema<`
      DEFINE USER editor ON NAMESPACE PASSWORD "secret" ROLES EDITOR
    `>;

    expectTypeOf<Schema['users']['editor']['level']>().toEqualTypeOf<'namespace'>();
  });

  it('extracts user on DATABASE level', () => {
    type Schema = ParseSchema<`
      DEFINE USER viewer ON DATABASE PASSWORD "secret" ROLES VIEWER
    `>;

    expectTypeOf<Schema['users']['viewer']['level']>().toEqualTypeOf<'database'>();
  });

  it('extracts user with PASSWORD', () => {
    type Schema = ParseSchema<`
      DEFINE USER admin ON ROOT PASSWORD "123456" ROLES OWNER
    `>;

    expectTypeOf<Schema['users']['admin']['hasPassword']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['users']['admin']['hasPasshash']>().toEqualTypeOf<false>();
  });

  it('extracts user with PASSHASH', () => {
    type Schema = ParseSchema<`
      DEFINE USER admin ON ROOT PASSHASH "$argon2id$..." ROLES OWNER
    `>;

    expectTypeOf<Schema['users']['admin']['hasPassword']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['users']['admin']['hasPasshash']>().toEqualTypeOf<true>();
  });

  it('extracts user with DURATION', () => {
    type Schema = ParseSchema<`
      DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER DURATION FOR TOKEN 5s, FOR SESSION 15m
    `>;

    expectTypeOf<Schema['users']['admin']['duration']>().toMatchTypeOf<{
      token: '5s';
      session: '15m';
    }>();
  });

  it('extracts user with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER COMMENT "Administrator"
    `>;

    expectTypeOf<Schema['users']['admin']['comment']>().toEqualTypeOf<'Administrator'>();
  });

  it('extracts user with multiple roles', () => {
    type Schema = ParseSchema<`
      DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER
    `>;

    expectTypeOf<Schema['users']['admin']['roles']>().toEqualTypeOf<['OWNER']>();
  });
});

describe('Sequence Definitions', () => {
  it('extracts basic sequence definition', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE mySeq
    `>;

    expectTypeOf<Schema['sequences']['mySeq']['name']>().toEqualTypeOf<'mySeq'>();
    expectTypeOf<Schema['sequences']['mySeq']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['sequences']['mySeq']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts sequence with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE OVERWRITE mySeq
    `>;

    expectTypeOf<Schema['sequences']['mySeq']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['sequences']['mySeq']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('extracts sequence with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE IF NOT EXISTS mySeq
    `>;

    expectTypeOf<Schema['sequences']['mySeq']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['sequences']['mySeq']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('extracts sequence with BATCH', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE mySeq BATCH 1000
    `>;

    expectTypeOf<Schema['sequences']['mySeq']['batch']>().toEqualTypeOf<1000>();
  });

  it('extracts sequence with START', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE mySeq START 100
    `>;

    expectTypeOf<Schema['sequences']['mySeq']['start']>().toEqualTypeOf<100>();
  });

  it('extracts sequence with TIMEOUT', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE mySeq TIMEOUT 5s
    `>;

    expectTypeOf<Schema['sequences']['mySeq']['timeout']>().toEqualTypeOf<'5s'>();
  });

  it('extracts sequence with all clauses', () => {
    type Schema = ParseSchema<`
      DEFINE SEQUENCE mySeq2 BATCH 1000 START 100 TIMEOUT 5s
    `>;

    expectTypeOf<Schema['sequences']['mySeq2']['name']>().toEqualTypeOf<'mySeq2'>();
    expectTypeOf<Schema['sequences']['mySeq2']['batch']>().toEqualTypeOf<1000>();
    expectTypeOf<Schema['sequences']['mySeq2']['start']>().toEqualTypeOf<100>();
    expectTypeOf<Schema['sequences']['mySeq2']['timeout']>().toEqualTypeOf<'5s'>();
  });
});

// ============================================================================
// ACCESS TESTS - BEARER, JWT, RECORD
// ============================================================================

describe('Access Definitions - Bearer', () => {
  it('parses basic bearer access for user', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS api_token ON DATABASE TYPE BEARER FOR USER
    `>;

    expectTypeOf<Schema['accesses']['api_token']>().toMatchTypeOf<{
      name: 'api_token';
      level: 'database';
      accessType: 'bearer';
      bearerFor: 'user';
    }>();
  });

  it('parses bearer access for record', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS record_token ON NAMESPACE TYPE BEARER FOR RECORD
    `>;

    expectTypeOf<Schema['accesses']['record_token']>().toMatchTypeOf<{
      name: 'record_token';
      level: 'namespace';
      accessType: 'bearer';
      bearerFor: 'record';
    }>();
  });

  it('parses bearer access with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS OVERWRITE my_bearer ON DATABASE TYPE BEARER FOR USER
    `>;

    expectTypeOf<Schema['accesses']['my_bearer']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['accesses']['my_bearer']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('parses bearer access with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS IF NOT EXISTS my_bearer ON DATABASE TYPE BEARER FOR USER
    `>;

    expectTypeOf<Schema['accesses']['my_bearer']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['accesses']['my_bearer']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('parses bearer access with DURATION', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS api ON DATABASE TYPE BEARER FOR USER DURATION FOR GRANT 1h FOR TOKEN 15m FOR SESSION 24h
    `>;

    type Access = Schema['accesses']['api'];
    expectTypeOf<Access['duration']>().toMatchTypeOf<{
      grant: '1h';
      token: '15m';
      session: '24h';
    }>();
  });

  it('parses bearer access with AUTHENTICATE', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS api ON DATABASE TYPE BEARER FOR USER AUTHENTICATE $token != NONE
    `>;

    expectTypeOf<Schema['accesses']['api']['authenticate']>().toEqualTypeOf<'$token != NONE'>();
  });
});

describe('Access Definitions - JWT', () => {
  it('parses basic JWT access', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT
    `>;

    expectTypeOf<Schema['accesses']['jwt_auth']>().toMatchTypeOf<{
      name: 'jwt_auth';
      level: 'database';
      accessType: 'jwt';
    }>();
  });

  it('parses JWT access on ROOT', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS root_jwt ON ROOT TYPE JWT
    `>;

    expectTypeOf<Schema['accesses']['root_jwt']['level']>().toEqualTypeOf<'root'>();
  });

  it('parses JWT access with ALGORITHM and KEY', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT ALGORITHM HS256 KEY "secret"
    `>;

    type Access = Schema['accesses']['jwt_auth'];
    expectTypeOf<Access['jwt']>().toMatchTypeOf<{
      algorithm: 'HS256';
      key: '"secret"';
    }>();
  });

  it('parses JWT access with URL', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT URL "https://auth.example.com/.well-known/jwks.json"
    `>;

    type Access = Schema['accesses']['jwt_auth'];
    expectTypeOf<
      Access['jwt']['url']
    >().toEqualTypeOf<'"https://auth.example.com/.well-known/jwks.json"'>();
  });

  it('parses JWT access with session duration', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT DURATION FOR SESSION 24h
    `>;

    expectTypeOf<Schema['accesses']['jwt_auth']['sessionDuration']>().toEqualTypeOf<'24h'>();
  });
});

describe('Access Definitions - Record', () => {
  it('parses basic record access', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS account ON DATABASE TYPE RECORD
    `>;

    expectTypeOf<Schema['accesses']['account']>().toExtend<{
      name: 'account';
      level: 'database';
      accessType: 'record';
    }>();
  });

  it('parses record access with SIGNUP and SIGNIN', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS account ON DATABASE TYPE RECORD
        SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
        SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
    `>;

    type Access = Schema['accesses']['account'];
    expectTypeOf<Access['signup']>().toExtend<string>();
    expectTypeOf<Access['signin']>().toExtend<string>();
  });

  it('parses record access with WITH REFRESH', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS account ON DATABASE TYPE RECORD WITH REFRESH
    `>;

    expectTypeOf<Schema['accesses']['account']['withRefresh']>().toEqualTypeOf<true>();
  });

  it('parses record access with JWT configuration', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS account ON DATABASE TYPE RECORD
        WITH JWT ALGORITHM RS256 KEY "public-key"
    `>;

    type Access = Schema['accesses']['account'];
    expectTypeOf<Access['jwt']>().toExtend<{
      algorithm: 'RS256';
      key: string;
    }>();
  });

  it('parses record access with JWT and ISSUER KEY', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS account ON DATABASE TYPE RECORD
        WITH JWT ALGORITHM RS256 KEY "public-key" WITH ISSUER KEY "issuer-key"
    `>;

    type Access = Schema['accesses']['account'];
    expectTypeOf<Access['jwt']>().toExtend<{
      issuerKey: string;
    }>();
  });

  it('parses record access with DURATION', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS account ON DATABASE TYPE RECORD DURATION FOR TOKEN 15m FOR SESSION 24h
    `>;

    type Access = Schema['accesses']['account'];
    expectTypeOf<Access['duration']>().toExtend<{
      token: '15m';
      session: '24h';
    }>();
  });

  it('parses full record access definition', () => {
    type Schema = ParseSchema<`
      DEFINE ACCESS OVERWRITE account ON DATABASE TYPE RECORD
        SIGNUP ( CREATE user SET email = $email )
        SIGNIN ( SELECT * FROM user WHERE email = $email )
        WITH JWT ALGORITHM HS512 KEY "secret"
        WITH REFRESH
        AUTHENTICATE $session.user != NONE
        DURATION FOR TOKEN 15m FOR SESSION 12h
    `>;

    type Access = Schema['accesses']['account'];
    expectTypeOf<Access['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Access['accessType']>().toEqualTypeOf<'record'>();
    expectTypeOf<Access['withRefresh']>().toEqualTypeOf<true>();
  });
});

// ============================================================================
// BUCKET TESTS
// ============================================================================

describe('Bucket Definitions', () => {
  it('parses basic bucket definition', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET my_bucket
    `>;

    expectTypeOf<Schema['buckets']['my_bucket']>().toMatchTypeOf<{
      name: 'my_bucket';
    }>();
  });

  it('parses bucket with memory backend', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET my_bucket BACKEND "memory"
    `>;

    expectTypeOf<Schema['buckets']['my_bucket']['name']>().toEqualTypeOf<'my_bucket'>();
    expectTypeOf<Schema['buckets']['my_bucket']['backend']>().toEqualTypeOf<'memory'>();
  });

  it('parses bucket with file backend', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET my_bucket BACKEND "file:/some_directory"
    `>;

    expectTypeOf<
      Schema['buckets']['my_bucket']['backend']
    >().toEqualTypeOf<'file:/some_directory'>();
  });

  it('parses bucket with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET OVERWRITE my_bucket BACKEND "memory"
    `>;

    expectTypeOf<Schema['buckets']['my_bucket']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['buckets']['my_bucket']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('parses bucket with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET IF NOT EXISTS my_bucket BACKEND "memory"
    `>;

    expectTypeOf<Schema['buckets']['my_bucket']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['buckets']['my_bucket']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('parses bucket with PERMISSIONS FULL', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET my_bucket BACKEND "memory" PERMISSIONS FULL
    `>;

    expectTypeOf<Schema['buckets']['my_bucket']['permissions']>().toEqualTypeOf<'FULL'>();
  });

  it('parses bucket with PERMISSIONS NONE', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET my_bucket BACKEND "memory" PERMISSIONS NONE
    `>;

    expectTypeOf<Schema['buckets']['my_bucket']['permissions']>().toEqualTypeOf<'NONE'>();
  });

  it('parses bucket with WHERE permissions', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET admin_bucket BACKEND "memory" PERMISSIONS WHERE $auth.admin = true
    `>;

    expectTypeOf<
      Schema['buckets']['admin_bucket']['permissions']
    >().toEqualTypeOf<'WHERE $auth.admin = true'>();
  });

  it('parses bucket with COMMENT', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET my_bucket BACKEND "memory" COMMENT "Storage for user files"
    `>;

    expectTypeOf<
      Schema['buckets']['my_bucket']['comment']
    >().toEqualTypeOf<'Storage for user files'>();
  });

  it('parses full bucket definition', () => {
    type Schema = ParseSchema<`
      DEFINE BUCKET OVERWRITE uploads BACKEND "file:/uploads" PERMISSIONS WHERE $auth.admin = true COMMENT "File uploads bucket"
    `>;

    type Bucket = Schema['buckets']['uploads'];
    expectTypeOf<Bucket['name']>().toEqualTypeOf<'uploads'>();
    expectTypeOf<Bucket['backend']>().toEqualTypeOf<'file:/uploads'>();
    expectTypeOf<Bucket['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Bucket['comment']>().toEqualTypeOf<'File uploads bucket'>();
  });
});

// ============================================================================
// CONFIG TESTS
// ============================================================================

describe('Config Definitions - GraphQL', () => {
  it('parses basic GraphQL config with AUTO', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL AUTO
    `>;

    expectTypeOf<Schema['configs']['graphql']['configType']>().toEqualTypeOf<'graphql'>();
  });

  it('parses GraphQL config with TABLES AUTO', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL TABLES AUTO
    `>;

    expectTypeOf<Schema['configs']['graphql']['tables']>().toEqualTypeOf<'AUTO'>();
  });

  it('parses GraphQL config with TABLES NONE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL TABLES NONE
    `>;

    expectTypeOf<Schema['configs']['graphql']['tables']>().toEqualTypeOf<'NONE'>();
  });

  it('parses GraphQL config with TABLES INCLUDE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL TABLES INCLUDE user, post, comment
    `>;

    expectTypeOf<
      Schema['configs']['graphql']['tables']
    >().toEqualTypeOf<'INCLUDE user, post, comment'>();
  });

  it('parses GraphQL config with FUNCTIONS AUTO', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL FUNCTIONS AUTO
    `>;

    expectTypeOf<Schema['configs']['graphql']['functions']>().toEqualTypeOf<'AUTO'>();
  });

  it('parses GraphQL config with FUNCTIONS NONE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL FUNCTIONS NONE
    `>;

    expectTypeOf<Schema['configs']['graphql']['functions']>().toEqualTypeOf<'NONE'>();
  });

  it('parses GraphQL config with FUNCTIONS INCLUDE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL FUNCTIONS INCLUDE [getUser, listPosts]
    `>;

    expectTypeOf<
      Schema['configs']['graphql']['functions']
    >().toEqualTypeOf<'INCLUDE [getUser, listPosts]'>();
  });

  it('parses GraphQL config with FUNCTIONS EXCLUDE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG GRAPHQL FUNCTIONS EXCLUDE [debugFunction, testFunction]
    `>;

    expectTypeOf<
      Schema['configs']['graphql']['functions']
    >().toEqualTypeOf<'EXCLUDE [debugFunction, testFunction]'>();
  });

  it('parses GraphQL config with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG OVERWRITE GRAPHQL TABLES AUTO
    `>;

    expectTypeOf<Schema['configs']['graphql']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['configs']['graphql']['ifNotExists']>().toEqualTypeOf<false>();
  });

  it('parses GraphQL config with IF NOT EXISTS', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG IF NOT EXISTS GRAPHQL TABLES AUTO
    `>;

    expectTypeOf<Schema['configs']['graphql']['overwrite']>().toEqualTypeOf<false>();
    expectTypeOf<Schema['configs']['graphql']['ifNotExists']>().toEqualTypeOf<true>();
  });

  it('parses full GraphQL config', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG OVERWRITE GRAPHQL TABLES INCLUDE user, post FUNCTIONS INCLUDE [getUser, listPosts]
    `>;

    type Config = Schema['configs']['graphql'];
    expectTypeOf<Config['configType']>().toEqualTypeOf<'graphql'>();
    expectTypeOf<Config['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<Config['tables']>().toEqualTypeOf<'INCLUDE user, post'>();
    expectTypeOf<Config['functions']>().toEqualTypeOf<'INCLUDE [getUser, listPosts]'>();
  });
});

describe('Config Definitions - API', () => {
  it('parses basic API config', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG API
    `>;

    expectTypeOf<Schema['configs']['api']['configType']>().toEqualTypeOf<'api'>();
  });

  it('parses API config with MIDDLEWARE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG API MIDDLEWARE api::timeout(10s)
    `>;

    expectTypeOf<Schema['configs']['api']['middleware']>().toEqualTypeOf<['api::timeout(10s)']>();
  });

  it('parses API config with multiple MIDDLEWARE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG API MIDDLEWARE api::timeout(10s), api::res::headers({ 'Access-Control-Allow-Origin': '*' })
    `>;

    type Middleware = Schema['configs']['api']['middleware'];
    expectTypeOf<Middleware[0]>().toEqualTypeOf<'api::timeout(10s)'>();
  });

  it('parses API config with PERMISSIONS FULL', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG API PERMISSIONS FULL
    `>;

    expectTypeOf<Schema['configs']['api']['permissions']>().toEqualTypeOf<'FULL'>();
  });

  it('parses API config with PERMISSIONS NONE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG API PERMISSIONS NONE
    `>;

    expectTypeOf<Schema['configs']['api']['permissions']>().toEqualTypeOf<'NONE'>();
  });

  it('parses API config with OVERWRITE', () => {
    type Schema = ParseSchema<`
      DEFINE CONFIG OVERWRITE API MIDDLEWARE api::timeout(10s)
    `>;

    expectTypeOf<Schema['configs']['api']['overwrite']>().toEqualTypeOf<true>();
  });
});

// ============================================================================
// COMPLETE DATABASE SCHEMA TEST
// ============================================================================

describe('Complete Database Schema', () => {
  it('extracts full database with all definition types', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER search_analyzer TOKENIZERS blank;

      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE FIELD email ON user TYPE string;
      DEFINE FIELD name ON user TYPE string;
      DEFINE INDEX idx_user_email ON user FIELDS email UNIQUE;
      DEFINE EVENT user_created ON user;

      DEFINE TABLE post SCHEMAFULL;
      DEFINE FIELD id ON post TYPE string READONLY;
      DEFINE FIELD title ON post TYPE string;
      DEFINE FIELD author_id ON post TYPE string;
      DEFINE INDEX idx_post_author ON post FIELDS author_id;

      DEFINE FUNCTION fn::get_user_posts($user_id);

      DEFINE PARAM $app_name
    `>;

    // Tables
    expectTypeOf<Schema['tables']['user']['name']>().toEqualTypeOf<'user'>();
    expectTypeOf<Schema['tables']['post']['name']>().toEqualTypeOf<'post'>();

    // Fields
    expectTypeOf<Schema['tables']['user']['fields']['email']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Schema['tables']['post']['fields']['title']['type']>().toEqualTypeOf<string>();

    // Indexes
    expectTypeOf<Schema['indexes']['idx_user_email']['table']>().toEqualTypeOf<'user'>();
    expectTypeOf<Schema['indexes']['idx_user_email']['unique']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['indexes']['idx_post_author']['table']>().toEqualTypeOf<'post'>();

    // Events
    expectTypeOf<Schema['events']['user_created']['table']>().toEqualTypeOf<'user'>();

    // Analyzers
    expectTypeOf<
      Schema['analyzers']['search_analyzer']['name']
    >().toEqualTypeOf<'search_analyzer'>();

    // Functions
    expectTypeOf<
      Schema['functions']['fn::get_user_posts']['name']
    >().toEqualTypeOf<'fn::get_user_posts'>();

    // Params
    expectTypeOf<Schema['params']['app_name']['name']>().toEqualTypeOf<'app_name'>();
  });
});

import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema, ParseStatement } from '../../../src';

describe('DEFINE TABLE', () => {
  describe('Basic table definitions', () => {
    it('parses basic table', () => {
      type result = ParseStatement<'DEFINE TABLE user'>;

      expectTypeOf<result>().toExtend<{
        kind: 'table';
        name: 'user';
        overwrite: false;
        ifNotExists: false;
      }>();
    });

    it('extracts simple table schema', () => {
      type schema = ParseSchema<'DEFINE TABLE user'>;

      expectTypeOf<schema['tables']['user']>().toExtend<{
        name: 'user';
        fields: Record<string, any>;
      }>();
      expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<schema['tables']['user']['ifNotExists']>().toEqualTypeOf<false>();
    });
  });

  describe('VIEW statements', () => {
    it('extracts AS SELECT query', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user_view AS SELECT * FROM user WHERE active = true
      `>;

      type View = Schema['tables']['user_view'];
      expectTypeOf<View['asSelect']>().toExtend<string>();
      expectTypeOf<View['asSelect']>().toExtend<'SELECT * FROM user WHERE active = true'>();
    });

    it('extracts AS SELECT with complex query', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE active_users AS SELECT id, email, name FROM user WHERE active = true AND deleted = false ORDER BY created_at DESC
      `>;

      type View = Schema['tables']['active_users'];
      expectTypeOf<View['asSelect']>().toExtend<string>();
    });

    it('extracts AS SELECT with JOIN', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user_posts AS SELECT u.id, u.email, p.title FROM user u JOIN post p ON u.id = p.author
      `>;

      type View = Schema['tables']['user_posts'];
      expectTypeOf<View['asSelect']>().toExtend<string>();
    });

    it('handles VIEW with permissions', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE public_view AS SELECT * FROM user PERMISSIONS FULL
      `>;

      type View = Schema['tables']['public_view'];
      expectTypeOf<View['asSelect']>().toExtend<string>();
      expectTypeOf<View['permissions']>().toExtend<{ full: true }>();
    });

    it('handles VIEW with comment', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user_view AS SELECT * FROM user COMMENT "Active users view"
      `>;

      type View = Schema['tables']['user_view'];
      expectTypeOf<View['asSelect']>().toExtend<string>();
      expectTypeOf<View['comment']>().toEqualTypeOf<'Active users view'>();
    });
  });

  describe('Schema modes', () => {
    it('parses SCHEMAFULL table', () => {
      type schema = ParseSchema<'DEFINE TABLE user SCHEMAFULL'>;

      expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemafull'>();
    });

    it('parses SCHEMALESS table', () => {
      type schema = ParseSchema<'DEFINE TABLE user SCHEMALESS'>;

      expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemaless'>();
    });

    it('defaults to schemaless when not specified', () => {
      type schema = ParseSchema<'DEFINE TABLE user'>;

      expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemaless'>();
    });
  });

  describe('Modifiers', () => {
    it('parses OVERWRITE modifier', () => {
      type schema = ParseSchema<'DEFINE TABLE OVERWRITE user SCHEMAFULL'>;

      expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<schema['tables']['user']['ifNotExists']>().toEqualTypeOf<false>();
    });

    it('parses IF NOT EXISTS modifier', () => {
      type schema = ParseSchema<'DEFINE TABLE IF NOT EXISTS user'>;

      expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<schema['tables']['user']['ifNotExists']>().toEqualTypeOf<true>();
    });

    it('parses DROP modifier', () => {
      type schema = ParseSchema<'DEFINE TABLE reading DROP'>;

      expectTypeOf<schema['tables']['reading']['drop']>().toEqualTypeOf<true>();
    });
  });

  describe('Table types', () => {
    it('parses TYPE NORMAL', () => {
      type schema = ParseSchema<'DEFINE TABLE user TYPE NORMAL'>;

      expectTypeOf<schema['tables']['user']['tableType']>().toEqualTypeOf<'normal'>();
    });

    it('parses TYPE ANY', () => {
      type schema = ParseSchema<'DEFINE TABLE data TYPE ANY'>;

      expectTypeOf<schema['tables']['data']['tableType']>().toEqualTypeOf<'any'>();
    });

    it('parses TYPE RELATION', () => {
      type schema = ParseSchema<'DEFINE TABLE likes TYPE RELATION'>;

      expectTypeOf<schema['tables']['likes']['tableType']>().toEqualTypeOf<'relation'>();
    });

    it('parses TYPE RELATION FROM TO', () => {
      type schema = ParseSchema<'DEFINE TABLE likes TYPE RELATION FROM user TO post'>;

      expectTypeOf<schema['tables']['likes']['tableType']>().toEqualTypeOf<'relation'>();
      expectTypeOf<schema['tables']['likes']['relationConfig']>().toExtend<{
        from: 'user';
        to: 'post';
      }>();
    });

    it('parses TYPE RELATION IN OUT', () => {
      type schema = ParseSchema<'DEFINE TABLE likes TYPE RELATION IN user OUT post'>;

      expectTypeOf<schema['tables']['likes']['relationConfig']>().toExtend<{
        from: 'user';
        to: 'post';
      }>();
    });

    it('parses TYPE RELATION ENFORCED', () => {
      type schema = ParseSchema<'DEFINE TABLE road_to TYPE RELATION IN city OUT city ENFORCED'>;

      expectTypeOf<schema['tables']['road_to']['relationConfig']>().toExtend<{
        from: 'city';
        to: 'city';
        enforced: true;
      }>();
    });
  });

  describe('Changefeed', () => {
    it('parses CHANGEFEED with duration', () => {
      type schema = ParseSchema<'DEFINE TABLE reading CHANGEFEED 3d'>;

      expectTypeOf<schema['tables']['reading']['changefeed']>().toExtend<{
        duration: '3d';
        includeOriginal: false;
      }>();
    });

    it('parses CHANGEFEED with INCLUDE ORIGINAL', () => {
      type schema = ParseSchema<'DEFINE TABLE reading CHANGEFEED 7d INCLUDE ORIGINAL'>;

      expectTypeOf<schema['tables']['reading']['changefeed']>().toExtend<{
        duration: '7d';
        includeOriginal: true;
      }>();
    });

    it('handles various duration formats', () => {
      type schema1 = ParseSchema<'DEFINE TABLE reading CHANGEFEED 1h'>;
      type schema2 = ParseSchema<'DEFINE TABLE reading CHANGEFEED 30m'>;
      type schema3 = ParseSchema<'DEFINE TABLE reading CHANGEFEED 2w'>;

      expectTypeOf<schema1['tables']['reading']['changefeed']>().toExtend<{
        duration: string;
      }>();
      expectTypeOf<schema2['tables']['reading']['changefeed']>().toExtend<{
        duration: string;
      }>();
      expectTypeOf<schema3['tables']['reading']['changefeed']>().toExtend<{
        duration: string;
      }>();
    });
  });

  describe('Permissions', () => {
    it('parses PERMISSIONS NONE', () => {
      type schema = ParseSchema<'DEFINE TABLE secret PERMISSIONS NONE'>;

      expectTypeOf<schema['tables']['secret']['permissions']>().toExtend<{
        none: true;
        full: false;
      }>();
    });

    it('parses PERMISSIONS FULL', () => {
      type schema = ParseSchema<'DEFINE TABLE public PERMISSIONS FULL'>;

      expectTypeOf<schema['tables']['public']['permissions']>().toExtend<{
        none: false;
        full: true;
      }>();
    });

    it('parses PERMISSIONS FOR clauses', () => {
      type schema = ParseSchema<`
        DEFINE TABLE user PERMISSIONS FOR select WHERE published=true FOR update WHERE user=$auth.id
      `>;

      type Perms = schema['tables']['user']['permissions'];
      expectTypeOf<Perms>().toExtend<{ full: false; none: false }>();
    });
  });

  describe('Comments', () => {
    it('parses COMMENT', () => {
      type schema = ParseSchema<'DEFINE TABLE user SCHEMAFULL COMMENT "User accounts"'>;

      expectTypeOf<schema['tables']['user']['comment']>().toEqualTypeOf<'User accounts'>();
    });

    it('handles empty comment', () => {
      type schema = ParseSchema<'DEFINE TABLE user COMMENT ""'>;

      expectTypeOf<schema['tables']['user']['comment']>().toEqualTypeOf<''>();
    });
  });

  describe('Edge cases', () => {
    it('handles case insensitive keywords', () => {
      type schema = ParseSchema<'define table user schemafull'>;

      expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemafull'>();
    });

    it('handles extra whitespace', () => {
      type schema = ParseSchema<'DEFINE  TABLE  user  SCHEMAFULL'>;

      expectTypeOf<schema['tables']['user']['name']>().toEqualTypeOf<'user'>();
    });

    it('handles table names with underscores', () => {
      type schema = ParseSchema<'DEFINE TABLE user_profile SCHEMAFULL'>;

      expectTypeOf<schema['tables']['user_profile']['name']>().toEqualTypeOf<'user_profile'>();
    });

    it('handles table names with numbers', () => {
      type schema = ParseSchema<'DEFINE TABLE user123 SCHEMAFULL'>;

      expectTypeOf<schema['tables']['user123']['name']>().toEqualTypeOf<'user123'>();
    });

    it('handles complex table name', () => {
      type schema = ParseSchema<'DEFINE TABLE user_profile_v2 SCHEMAFULL'>;

      expectTypeOf<
        schema['tables']['user_profile_v2']['name']
      >().toEqualTypeOf<'user_profile_v2'>();
    });
  });

  describe('Combined options', () => {
    it('parses table with all options', () => {
      type schema = ParseSchema<`
        DEFINE TABLE OVERWRITE user SCHEMAFULL TYPE NORMAL CHANGEFEED 7d INCLUDE ORIGINAL PERMISSIONS FULL COMMENT "User table"
      `>;

      expectTypeOf<schema['tables']['user']['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemafull'>();
      expectTypeOf<schema['tables']['user']['tableType']>().toEqualTypeOf<'normal'>();
      expectTypeOf<schema['tables']['user']['changefeed']>().toExtend<{
        duration: string;
        includeOriginal: true;
      }>();
      expectTypeOf<schema['tables']['user']['permissions']>().toExtend<{ full: true }>();
      expectTypeOf<schema['tables']['user']['comment']>().toEqualTypeOf<'User table'>();
    });
  });
});

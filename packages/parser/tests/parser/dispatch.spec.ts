import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseStatement } from '../../src';

describe('ParseStatement', () => {
  describe('Basic parsing', () => {
    it('parses DEFINE TABLE', () => {
      type result = ParseStatement<'DEFINE TABLE user'>;

      expectTypeOf<result>().toExtend<{ kind: 'table'; name: 'user' }>();
    });

    it('parses DEFINE TABLE with SCHEMAFULL', () => {
      type result = ParseStatement<'DEFINE TABLE user SCHEMAFULL'>;

      expectTypeOf<result>().toExtend<{
        kind: 'table';
        name: 'user';
        schemaMode: 'schemafull';
      }>();
    });

    it('parses DEFINE FIELD', () => {
      type result = ParseStatement<'DEFINE FIELD name ON user TYPE string'>;

      expectTypeOf<result>().toExtend<{ kind: 'field'; name: 'name'; table: 'user' }>();
    });
  });

  describe('Case insensitivity', () => {
    it('parses lowercase DEFINE TABLE', () => {
      type result = ParseStatement<'define table user'>;

      expectTypeOf<result>().toExtend<{ kind: 'table'; name: 'user' }>();
    });

    it('parses mixed case DEFINE TABLE', () => {
      type result = ParseStatement<'Define Table User'>;

      expectTypeOf<result>().toExtend<{ kind: 'table'; name: 'User' }>();
    });
  });

  describe('Edge cases', () => {
    it('handles trailing whitespace', () => {
      type result = ParseStatement<'DEFINE TABLE user   '>;

      expectTypeOf<result>().toExtend<{ kind: 'table'; name: 'user' }>();
    });

    it('handles leading whitespace', () => {
      type result = ParseStatement<'   DEFINE TABLE user'>;

      expectTypeOf<result>().toExtend<{ kind: 'table'; name: 'user' }>();
    });

    it('handles whitespace on both ends', () => {
      type result = ParseStatement<'   DEFINE TABLE user   '>;

      expectTypeOf<result>().toExtend<{ kind: 'table'; name: 'user' }>();
    });

    it('handles multiple spaces between words', () => {
      type result1 = ParseStatement<'DEFINE  TABLE  user'>;
      type result2 = ParseStatement<'DEFINE   TABLE   user'>;
      type result3 = ParseStatement<'DEFINE    TABLE    user    SCHEMAFULL'>;

      expectTypeOf<result1>().toExtend<{ kind: 'table' }>();
      expectTypeOf<result2>().toExtend<{ kind: 'table' }>();
      expectTypeOf<result3>().toExtend<{ kind: 'table'; schemaMode: 'schemafull' }>();
    });

    it('handles tabs between words', () => {
      type result1 = ParseStatement<'DEFINE\tTABLE\tuser'>;
      type result2 = ParseStatement<'DEFINE\t\tTABLE\t\tuser'>;

      expectTypeOf<result1>().toExtend<{ kind: 'table' }>();
      expectTypeOf<result2>().toExtend<{ kind: 'table' }>();
    });

    it('handles newlines between words', () => {
      type result1 = ParseStatement<'DEFINE\nTABLE\nuser'>;
      type result2 = ParseStatement<'DEFINE\n\nTABLE\n\nuser'>;

      expectTypeOf<result1>().toExtend<{ kind: 'table' }>();
      expectTypeOf<result2>().toExtend<{ kind: 'table' }>();
    });

    it('handles mixed whitespace characters', () => {
      type result1 = ParseStatement<'\n\t  DEFINE TABLE user  \r\n'>;
      type result2 = ParseStatement<'DEFINE\t  TABLE\n  user'>;
      type result3 = ParseStatement<'  DEFINE  \t  TABLE  \n  user  '>;

      expectTypeOf<result1>().toExtend<{ kind: 'table' }>();
      expectTypeOf<result2>().toExtend<{ kind: 'table' }>();
      expectTypeOf<result3>().toExtend<{ kind: 'table' }>();
    });

    it('handles complex whitespace in FIELD statements', () => {
      type result = ParseStatement<'DEFINE  FIELD  name  ON  user  TYPE  string'>;

      expectTypeOf<result>().toExtend<{ kind: 'field' }>();
    });
  });
});

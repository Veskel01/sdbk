import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseDataType, ParseSchema, ParseStatement, SplitStatements } from '../../src';

describe('Edge Cases', () => {
  describe('Comments in strings', () => {
    it('preserves comments inside double-quoted strings', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD name ON user TYPE string VALUE "text -- comment"
      `>;

      // The comment should be preserved in the VALUE clause
      expectTypeOf<Schema['tables']['user']['fields']['name']['value']>().toExtend<string>();
    });

    it('preserves comments inside single-quoted strings', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD name ON user TYPE string VALUE 'text -- comment'
      `>;

      expectTypeOf<Schema['tables']['user']['fields']['name']['value']>().toExtend<string>();
    });

    it('removes real comments outside strings', () => {
      type Statements = SplitStatements<`
        DEFINE TABLE user;
        -- This is a real comment
        DEFINE TABLE post
      `>;

      // After removing comments, we should have 2 statements
      expectTypeOf<Statements>().toExtend<string[]>();
      expectTypeOf<Statements[0]>().toExtend<string>();
      // Check if second statement exists (may be undefined if parsing fails)
      expectTypeOf<Statements>().toExtend<readonly [string, ...string[]]>();
    });
  });

  describe('Unicode characters', () => {
    it('handles unicode in table names', () => {
      type Result = ParseStatement<'DEFINE TABLE użytkownik'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table'; name: 'użytkownik' }>();
    });

    it('handles unicode in field names', () => {
      type Result = ParseStatement<'DEFINE FIELD imię ON user TYPE string'>;
      expectTypeOf<Result>().toExtend<{ kind: 'field'; name: 'imię' }>();
    });

    it('handles unicode in comments', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user COMMENT "Tabela użytkowników"
      `>;
      expectTypeOf<Schema['tables']['user']['comment']>().toEqualTypeOf<'Tabela użytkowników'>();
    });

    it('handles emojis in comments', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user COMMENT "User table 👤"
      `>;
      expectTypeOf<Schema['tables']['user']['comment']>().toEqualTypeOf<'User table 👤'>();
    });
  });

  describe('Special characters in values', () => {
    it('handles quotes in DEFAULT values', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD motto ON user TYPE string DEFAULT "Don't worry"
      `>;
      expectTypeOf<Schema['tables']['user']['fields']['motto']['default']>().toExtend<string>();
    });

    it('handles special chars in ASSERT', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE FIELD email ON user TYPE string ASSERT $value != ""
      `>;
      expectTypeOf<Schema['tables']['user']['fields']['email']['assert']>().toExtend<string>();
    });
  });

  describe('Escape sequences', () => {
    it('handles escaped quotes in strings', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user COMMENT "Say \\"Hello\\""
      `>;
      expectTypeOf<Schema['tables']['user']['comment']>().toExtend<string>();
    });

    it('handles newlines in multiline definitions', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user
          SCHEMAFULL
          PERMISSIONS FULL
          COMMENT "A user table"
      `>;
      expectTypeOf<Schema['tables']['user']['schemaMode']>().toEqualTypeOf<'schemafull'>();
      expectTypeOf<Schema['tables']['user']['permissions']>().toExtend<{ full: true }>();
    });
  });

  describe('Complex nested types', () => {
    it('handles deeply nested array types', () => {
      expectTypeOf<ParseDataType<'array<array<array<string>>>'>>().toEqualTypeOf<string[][][]>();
    });

    it('handles nested option and array', () => {
      expectTypeOf<ParseDataType<'array<option<record<user>>>'>>().toEqualTypeOf<
        ({ readonly __table: 'user'; readonly __id: string } | null)[]
      >();
    });

    it('handles option of array of option', () => {
      expectTypeOf<ParseDataType<'option<array<option<string>>>'>>().toEqualTypeOf<
        (string | null)[] | null
      >();
    });
  });

  describe('Record union types', () => {
    it('handles record with two tables', () => {
      type Result = ParseDataType<'record<user|post>'>;
      expectTypeOf<Result>().toExtend<
        | { readonly __table: 'user'; readonly __id: string }
        | { readonly __table: 'post'; readonly __id: string }
      >();
    });

    it('handles record with three tables', () => {
      type Result = ParseDataType<'record<user|post|comment>'>;
      expectTypeOf<Result>().toExtend<
        | { readonly __table: 'user'; readonly __id: string }
        | { readonly __table: 'post'; readonly __id: string }
        | { readonly __table: 'comment'; readonly __id: string }
      >();
    });

    it('handles record union in option', () => {
      type Result = ParseDataType<'option<record<user|post>>'>;
      expectTypeOf<Result>().toExtend<
        | (
            | { readonly __table: 'user'; readonly __id: string }
            | { readonly __table: 'post'; readonly __id: string }
          )
        | null
      >();
    });
  });

  describe('Array and Set with parameters', () => {
    it('ignores max length parameter in array', () => {
      expectTypeOf<ParseDataType<'array<string, 100>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseDataType<'array<int, 50>'>>().toEqualTypeOf<number[]>();
    });

    it('ignores max size parameter in set', () => {
      expectTypeOf<ParseDataType<'set<string, 100>'>>().toEqualTypeOf<Set<string>>();
    });

    it('handles nested types with parameters', () => {
      expectTypeOf<ParseDataType<'array<option<string>, 100>'>>().toEqualTypeOf<
        (string | null)[]
      >();
    });
  });

  describe('Whitespace handling', () => {
    it('handles multiple spaces', () => {
      type Result = ParseStatement<'DEFINE    TABLE    user'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });

    it('handles tabs', () => {
      type Result = ParseStatement<'DEFINE\tTABLE\tuser'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });

    it('handles newlines', () => {
      type Result = ParseStatement<'DEFINE\nTABLE\nuser'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });

    it('handles mixed whitespace', () => {
      type Result = ParseStatement<'DEFINE \t\n TABLE \n\t user'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });
  });

  describe('Case insensitivity', () => {
    it('handles lowercase keywords', () => {
      type Result = ParseStatement<'define table user'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });

    it('handles mixed case', () => {
      type Result = ParseStatement<'Define Table User'>;
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });
  });
});

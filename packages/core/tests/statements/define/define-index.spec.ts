import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE INDEX', () => {
  describe('Basic index definitions', () => {
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
  });

  describe('Modifiers', () => {
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
  });

  describe('Composite indexes', () => {
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

    it('extracts index with three fields', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE INDEX idx_multi ON user FIELDS first_name, last_name, email
      `>;

      expectTypeOf<Schema['indexes']['idx_multi']['fields']>().toEqualTypeOf<
        ['first_name', 'last_name', 'email']
      >();
    });
  });

  describe('Index types', () => {
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

    it('extracts HNSW index with TYPE and DIST', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE document;
        DEFINE INDEX idx_embedding ON document FIELDS embedding HNSW DIMENSION 128 TYPE F32 DIST COSINE
      `>;

      expectTypeOf<Schema['indexes']['idx_embedding']['hnswConfig']>().toMatchTypeOf<{
        dimension: 128;
        type: 'F32';
        dist: 'COSINE';
      }>();
    });
  });

  describe('Additional options', () => {
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

  describe('Edge cases', () => {
    it('handles index names with underscores', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE INDEX idx_user_email ON user FIELDS email
      `>;

      expectTypeOf<Schema['indexes']['idx_user_email']['name']>().toEqualTypeOf<'idx_user_email'>();
    });

    it('handles index names with numbers', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE INDEX idx_email_v2 ON user FIELDS email
      `>;

      expectTypeOf<Schema['indexes']['idx_email_v2']['name']>().toEqualTypeOf<'idx_email_v2'>();
    });

    it('handles multiple indexes on same table', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user;
        DEFINE INDEX idx_email ON user FIELDS email;
        DEFINE INDEX idx_name ON user FIELDS name
      `>;

      expectTypeOf<Schema['indexes']['idx_email']['table']>().toEqualTypeOf<'user'>();
      expectTypeOf<Schema['indexes']['idx_name']['table']>().toEqualTypeOf<'user'>();
    });
  });
});

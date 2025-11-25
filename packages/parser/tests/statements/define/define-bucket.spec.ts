import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE BUCKET', () => {
  describe('Basic bucket definitions', () => {
    it('parses basic bucket definition', () => {
      type Schema = ParseSchema<`
        DEFINE BUCKET my_bucket
      `>;

      expectTypeOf<Schema['buckets']['my_bucket']>().toExtend<{
        name: 'my_bucket';
      }>();
    });
  });

  describe('Backend options', () => {
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
  });

  describe('Modifiers', () => {
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
  });

  describe('Permissions', () => {
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
  });

  describe('Comments', () => {
    it('parses bucket with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE BUCKET my_bucket BACKEND "memory" COMMENT "Storage for user files"
      `>;

      expectTypeOf<
        Schema['buckets']['my_bucket']['comment']
      >().toEqualTypeOf<'Storage for user files'>();
    });
  });

  describe('Complex bucket definitions', () => {
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
});

import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE USER', () => {
  describe('Basic user definitions', () => {
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
  });

  describe('User levels', () => {
    it('extracts user on ROOT level', () => {
      type Schema = ParseSchema<`
        DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER
      `>;

      expectTypeOf<Schema['users']['admin']['level']>().toEqualTypeOf<'root'>();
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
  });

  describe('Authentication', () => {
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
  });

  describe('Roles', () => {
    it('extracts user with single role', () => {
      type Schema = ParseSchema<`
        DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER
      `>;

      expectTypeOf<Schema['users']['admin']['roles']>().toEqualTypeOf<['OWNER']>();
    });
  });

  describe('Duration', () => {
    it('extracts user with DURATION', () => {
      type Schema = ParseSchema<`
        DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER DURATION FOR TOKEN 5s, FOR SESSION 15m
      `>;

      expectTypeOf<Schema['users']['admin']['duration']>().toMatchTypeOf<{
        token: '5s';
        session: '15m';
      }>();
    });
  });

  describe('Modifiers', () => {
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
  });

  describe('Comments', () => {
    it('extracts user with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER COMMENT "Administrator"
      `>;

      expectTypeOf<Schema['users']['admin']['comment']>().toEqualTypeOf<'Administrator'>();
    });
  });
});

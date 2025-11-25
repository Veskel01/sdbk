import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE PARAM', () => {
  describe('Basic param definitions', () => {
    it('extracts param definition', () => {
      type Schema = ParseSchema<`
        DEFINE PARAM $api_key
      `>;

      expectTypeOf<Schema['params']['api_key']>().toExtend<{
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
  });

  describe('Value clause', () => {
    it('extracts param with VALUE', () => {
      type Schema = ParseSchema<`
        DEFINE PARAM $endpointBase VALUE "https://dummyjson.com"
      `>;

      expectTypeOf<
        Schema['params']['endpointBase']['value']
      >().toEqualTypeOf<'"https://dummyjson.com"'>();
    });
  });

  describe('Modifiers', () => {
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
  });

  describe('Permissions', () => {
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

  describe('Comments', () => {
    it('extracts param with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE PARAM $api_url VALUE "https://api.example.com" COMMENT "API base URL"
      `>;

      expectTypeOf<Schema['params']['api_url']['comment']>().toEqualTypeOf<'API base URL'>();
    });
  });
});

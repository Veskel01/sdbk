import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE CONFIG', () => {
  describe('GraphQL config', () => {
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

  describe('API config', () => {
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
  });

  describe('Modifiers', () => {
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

    it('parses API config with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE CONFIG OVERWRITE API MIDDLEWARE api::timeout(10s)
      `>;

      expectTypeOf<Schema['configs']['api']['overwrite']>().toEqualTypeOf<true>();
    });
  });
});

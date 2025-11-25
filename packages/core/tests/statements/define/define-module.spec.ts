import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE MODULE', () => {
  describe('Basic module definitions', () => {
    it('extracts basic module definition', () => {
      type Schema = ParseSchema<`
        DEFINE MODULE mod::test AS f"test:/demo.surli"
      `>;

      expectTypeOf<Schema['modules']['mod::test']['name']>().toEqualTypeOf<'mod::test'>();
      expectTypeOf<
        Schema['modules']['mod::test']['fileName']
      >().toEqualTypeOf<'test:/demo.surli'>();
      expectTypeOf<Schema['modules']['mod::test']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<Schema['modules']['mod::test']['ifNotExists']>().toEqualTypeOf<false>();
    });

    it('extracts module with double-quoted file name', () => {
      type Schema = ParseSchema<`
        DEFINE MODULE mod::auth AS "auth:/login.surli"
      `>;

      expectTypeOf<
        Schema['modules']['mod::auth']['fileName']
      >().toEqualTypeOf<'auth:/login.surli'>();
    });
  });

  describe('Modifiers', () => {
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
  });
});

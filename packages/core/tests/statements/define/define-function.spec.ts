import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE FUNCTION', () => {
  describe('Basic function definitions', () => {
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
  });

  describe('Function parameters', () => {
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
  });

  describe('Function body', () => {
    it('extracts function with body', () => {
      type Schema = ParseSchema<`
        DEFINE FUNCTION fn::greet($name: string) { RETURN "Hello, " + $name + "!"; }
      `>;

      type Fn = Schema['functions']['fn::greet'];
      expectTypeOf<Fn['body']>().toEqualTypeOf<'{ RETURN "Hello, " + $name + "!"; }'>();
    });
  });

  describe('Modifiers', () => {
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
  });

  describe('Permissions', () => {
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
  });

  describe('Comments', () => {
    it('extracts function with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE FUNCTION fn::greet($name: string) { RETURN "Hello!"; } COMMENT "Greeting function"
      `>;

      expectTypeOf<
        Schema['functions']['fn::greet']['comment']
      >().toEqualTypeOf<'Greeting function'>();
    });
  });

  describe('Complex function definitions', () => {
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
});

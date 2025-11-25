import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseType } from '../../src';

describe('ParseType', () => {
  describe('Basic types', () => {
    it('parses string type', () => {
      expectTypeOf<ParseType<'string'>>().toEqualTypeOf<string>();
    });

    it('parses int type', () => {
      expectTypeOf<ParseType<'int'>>().toEqualTypeOf<number>();
    });

    it('parses float type', () => {
      expectTypeOf<ParseType<'float'>>().toEqualTypeOf<number>();
    });

    it('parses number type', () => {
      expectTypeOf<ParseType<'number'>>().toEqualTypeOf<number>();
    });

    it('parses decimal type', () => {
      expectTypeOf<ParseType<'decimal'>>().toEqualTypeOf<number>();
    });

    it('parses bool type', () => {
      expectTypeOf<ParseType<'bool'>>().toEqualTypeOf<boolean>();
    });

    it('parses object type', () => {
      expectTypeOf<ParseType<'object'>>().toEqualTypeOf<Record<string, unknown>>();
    });

    it('parses any type', () => {
      expectTypeOf<ParseType<'any'>>().toEqualTypeOf<unknown>();
    });
  });

  describe('Date/Time types', () => {
    it('parses datetime type', () => {
      expectTypeOf<ParseType<'datetime'>>().toEqualTypeOf<Date>();
    });

    it('parses duration type', () => {
      expectTypeOf<ParseType<'duration'>>().toEqualTypeOf<string>();
    });
  });

  describe('Identifier types', () => {
    it('parses uuid type', () => {
      expectTypeOf<ParseType<'uuid'>>().toEqualTypeOf<string>();
    });

    it('parses ulid type', () => {
      expectTypeOf<ParseType<'ulid'>>().toEqualTypeOf<string>();
    });
  });

  describe('Binary types', () => {
    it('parses bytes type', () => {
      expectTypeOf<ParseType<'bytes'>>().toEqualTypeOf<Uint8Array>();
    });
  });

  describe('Complex types', () => {
    it('parses array types', () => {
      expectTypeOf<ParseType<'array<string>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseType<'array<int>'>>().toEqualTypeOf<number[]>();
      expectTypeOf<ParseType<'array<bool>'>>().toEqualTypeOf<boolean[]>();
    });

    it('parses nested array types', () => {
      expectTypeOf<ParseType<'array<array<string>>'>>().toEqualTypeOf<string[][]>();
    });

    it('parses option types', () => {
      expectTypeOf<ParseType<'option<string>'>>().toEqualTypeOf<string | null>();
      expectTypeOf<ParseType<'option<int>'>>().toEqualTypeOf<number | null>();
      expectTypeOf<ParseType<'option<bool>'>>().toEqualTypeOf<boolean | null>();
    });

    it('parses set types', () => {
      expectTypeOf<ParseType<'set<string>'>>().toEqualTypeOf<Set<string>>();
      expectTypeOf<ParseType<'set<int>'>>().toEqualTypeOf<Set<number>>();
    });

    it('parses record types', () => {
      expectTypeOf<ParseType<'record<user>'>>().toMatchTypeOf<{
        readonly __table: 'user';
        readonly __id: string;
      }>();
    });

    it('parses record type without parameter', () => {
      expectTypeOf<ParseType<'record'>>().toMatchTypeOf<{
        readonly __table: string;
        readonly __id: string;
      }>();
    });

    it('parses geometry types', () => {
      expectTypeOf<ParseType<'geometry<point>'>>().toMatchTypeOf<{
        type: string;
        coordinates: unknown;
      }>();
    });
  });

  describe('Combined types', () => {
    it('parses option array', () => {
      expectTypeOf<ParseType<'option<array<string>>'>>().toEqualTypeOf<string[] | null>();
    });

    it('parses array option', () => {
      expectTypeOf<ParseType<'array<option<string>>'>>().toEqualTypeOf<(string | null)[]>();
    });

    it('parses set array', () => {
      expectTypeOf<ParseType<'array<set<string>>'>>().toEqualTypeOf<Set<string>[]>();
    });
  });

  describe('Edge cases', () => {
    it('handles whitespace in type names', () => {
      expectTypeOf<ParseType<'  string  '>>().toEqualTypeOf<string>();
      expectTypeOf<ParseType<'  array<string>  '>>().toEqualTypeOf<string[]>();
    });

    it('handles case variations', () => {
      expectTypeOf<ParseType<'STRING'>>().toEqualTypeOf<string>();
      expectTypeOf<ParseType<'Array<string>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseType<'OPTION<string>'>>().toEqualTypeOf<string | null>();
    });

    it('handles unknown types', () => {
      expectTypeOf<ParseType<'unknown_type'>>().toEqualTypeOf<unknown>();
    });
  });
});

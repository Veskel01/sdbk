import { describe, expectTypeOf, it } from 'bun:test';
import type { GeoJSON, ParseType } from '../../src';

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
      expectTypeOf<ParseType<'duration'>>().toExtend<string & { readonly __duration: true }>();
    });

    it('parses duration subtypes', () => {
      expectTypeOf<ParseType<'duration<year>'>>().toExtend<
        string & { readonly __duration: true; readonly __subtype: 'year' }
      >();
      expectTypeOf<ParseType<'duration<month>'>>().toExtend<
        string & { readonly __duration: true; readonly __subtype: 'month' }
      >();
      expectTypeOf<ParseType<'duration<day>'>>().toExtend<
        string & { readonly __duration: true; readonly __subtype: 'day' }
      >();
      expectTypeOf<ParseType<'duration<hour>'>>().toExtend<
        string & { readonly __duration: true; readonly __subtype: 'hour' }
      >();
      expectTypeOf<ParseType<'duration<minute>'>>().toExtend<
        string & { readonly __duration: true; readonly __subtype: 'minute' }
      >();
      expectTypeOf<ParseType<'duration<second>'>>().toExtend<
        string & { readonly __duration: true; readonly __subtype: 'second' }
      >();
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
      expectTypeOf<ParseType<'record<user>'>>().toEqualTypeOf<{
        readonly __table: 'user';
        readonly __id: string;
      }>();
    });

    it('parses record type without parameter', () => {
      expectTypeOf<ParseType<'record'>>().toEqualTypeOf<{
        readonly __table: string;
        readonly __id: string;
      }>();
    });

    it('parses geometry types', () => {
      expectTypeOf<ParseType<'geometry<point>'>>().toExtend<{
        type: string;
        coordinates: unknown;
      }>();
    });

    it('parses geometry subtypes', () => {
      expectTypeOf<ParseType<'geometry<point>'>>().toExtend<{
        type: 'Point';
        coordinates: [number, number];
      }>();
      expectTypeOf<ParseType<'geometry<linestring>'>>().toExtend<{
        type: 'LineString';
        coordinates: [number, number][];
      }>();
      expectTypeOf<ParseType<'geometry<polygon>'>>().toExtend<{
        type: 'Polygon';
        coordinates: [number, number][][];
      }>();
      expectTypeOf<ParseType<'geometry<multipoint>'>>().toExtend<{
        type: 'MultiPoint';
        coordinates: [number, number][];
      }>();
      expectTypeOf<ParseType<'geometry<multilinestring>'>>().toExtend<{
        type: 'MultiLineString';
        coordinates: [number, number][][];
      }>();
      expectTypeOf<ParseType<'geometry<multipolygon>'>>().toExtend<{
        type: 'MultiPolygon';
        coordinates: [number, number][][][];
      }>();
      expectTypeOf<ParseType<'geometry<geometrycollection>'>>().toExtend<{
        type: 'GeometryCollection';
        geometries: unknown[];
      }>();
      // Unknown subtype falls back to GeoJSON
      expectTypeOf<ParseType<'geometry<unknown>'>>().toExtend<GeoJSON>();
    });

    it('parses range types', () => {
      expectTypeOf<ParseType<'range<int>'>>().toEqualTypeOf<[number, number]>();
      expectTypeOf<ParseType<'range<float>'>>().toEqualTypeOf<[number, number]>();
      expectTypeOf<ParseType<'range<number>'>>().toEqualTypeOf<[number, number]>();
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

  describe('Record types with pipe separator', () => {
    it('parses record with single table', () => {
      expectTypeOf<ParseType<'record<user>'>>().toExtend<{
        readonly __table: 'user';
        readonly __id: string;
      }>();
    });

    it('parses record with union types', () => {
      type Result = ParseType<'record<user|post>'>;
      expectTypeOf<Result>().toExtend<
        | { readonly __table: 'user'; readonly __id: string }
        | { readonly __table: 'post'; readonly __id: string }
      >();
    });

    it('parses record with multiple union types', () => {
      type Result = ParseType<'record<user|post|comment>'>;
      expectTypeOf<Result>().toExtend<
        | { readonly __table: 'user'; readonly __id: string }
        | { readonly __table: 'post'; readonly __id: string }
        | { readonly __table: 'comment'; readonly __id: string }
      >();
    });

    it('handles whitespace in union types', () => {
      type Result = ParseType<'record<user | post>'>;
      expectTypeOf<Result>().toExtend<
        | { readonly __table: 'user'; readonly __id: string }
        | { readonly __table: 'post'; readonly __id: string }
      >();
    });
  });

  describe('Array and Set with parameters', () => {
    it('parses array with max length parameter', () => {
      expectTypeOf<ParseType<'array<string, 100>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseType<'array<int, 50>'>>().toEqualTypeOf<number[]>();
    });

    it('parses set with max size parameter', () => {
      expectTypeOf<ParseType<'set<string, 100>'>>().toEqualTypeOf<Set<string>>();
      expectTypeOf<ParseType<'set<int, 50>'>>().toEqualTypeOf<Set<number>>();
    });

    it('parses nested types with parameters', () => {
      expectTypeOf<ParseType<'array<option<string>, 100>'>>().toEqualTypeOf<(string | null)[]>();
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

    it('handles deeply nested types within limit', () => {
      // 5 levels deep - should work
      expectTypeOf<ParseType<'array<array<array<array<array<string>>>>>>'>>().toEqualTypeOf<
        string[][][][][]
      >();
    });

    it('handles complex nested types', () => {
      // array<option<array<option<record<user>>>>> = ((RecordId<'user'> | null)[] | null)[]
      type Result = ParseType<'array<option<array<option<record<user>>>>>'>;
      type InnerArray = ({ readonly __table: 'user'; readonly __id: string } | null)[];
      type Expected = (InnerArray | null)[];
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });
});

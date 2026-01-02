import { describe, expectTypeOf, it } from 'bun:test';
import type {
  Bytes,
  Datetime,
  Duration,
  Geometry,
  GeometryCollection,
  LineStringGeometry,
  MultiLineStringGeometry,
  MultiPointGeometry,
  MultiPolygonGeometry,
  ParseDataType,
  PointGeometry,
  PolygonGeometry,
  Range,
  RecordId,
  ULID,
  UUID
} from '../../src';

describe('ParseDataType', () => {
  describe('Basic types', () => {
    it('parses string type', () => {
      expectTypeOf<ParseDataType<'string'>>().toEqualTypeOf<string>();
    });

    it('parses int type', () => {
      expectTypeOf<ParseDataType<'int'>>().toEqualTypeOf<number>();
    });

    it('parses float type', () => {
      expectTypeOf<ParseDataType<'float'>>().toEqualTypeOf<number>();
    });

    it('parses number type', () => {
      expectTypeOf<ParseDataType<'number'>>().toEqualTypeOf<number>();
    });

    it('parses decimal type', () => {
      expectTypeOf<ParseDataType<'decimal'>>().toEqualTypeOf<number>();
    });

    it('parses bool type', () => {
      expectTypeOf<ParseDataType<'bool'>>().toEqualTypeOf<boolean>();
    });

    it('parses object type', () => {
      expectTypeOf<ParseDataType<'object'>>().toEqualTypeOf<Record<string, unknown>>();
    });

    it('parses any type', () => {
      expectTypeOf<ParseDataType<'any'>>().toEqualTypeOf<unknown>();
    });
  });

  describe('Date/Time types', () => {
    it('parses datetime type', () => {
      expectTypeOf<ParseDataType<'datetime'>>().toEqualTypeOf<Datetime>();
    });

    it('parses duration type', () => {
      expectTypeOf<ParseDataType<'duration'>>().toEqualTypeOf<Duration>();
    });

    it('parses duration subtypes', () => {
      expectTypeOf<ParseDataType<'duration<year>'>>().toEqualTypeOf<Duration<'year'>>();
      expectTypeOf<ParseDataType<'duration<month>'>>().toEqualTypeOf<Duration<'month'>>();
      expectTypeOf<ParseDataType<'duration<day>'>>().toEqualTypeOf<Duration<'day'>>();
      expectTypeOf<ParseDataType<'duration<hour>'>>().toEqualTypeOf<Duration<'hour'>>();
      expectTypeOf<ParseDataType<'duration<minute>'>>().toEqualTypeOf<Duration<'minute'>>();
      expectTypeOf<ParseDataType<'duration<second>'>>().toEqualTypeOf<Duration<'second'>>();
    });
  });

  describe('Identifier types', () => {
    it('parses uuid type', () => {
      expectTypeOf<ParseDataType<'uuid'>>().toEqualTypeOf<UUID>();
    });

    it('parses ulid type', () => {
      expectTypeOf<ParseDataType<'ulid'>>().toEqualTypeOf<ULID>();
    });
  });

  describe('Binary types', () => {
    it('parses bytes type', () => {
      expectTypeOf<ParseDataType<'bytes'>>().toEqualTypeOf<Bytes>();
    });
  });

  describe('Complex types', () => {
    it('parses array types', () => {
      expectTypeOf<ParseDataType<'array<string>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseDataType<'array<int>'>>().toEqualTypeOf<number[]>();
      expectTypeOf<ParseDataType<'array<bool>'>>().toEqualTypeOf<boolean[]>();
    });

    it('parses nested array types', () => {
      expectTypeOf<ParseDataType<'array<array<string>>'>>().toEqualTypeOf<string[][]>();
    });

    it('parses option types', () => {
      expectTypeOf<ParseDataType<'option<string>'>>().toEqualTypeOf<string | null>();
      expectTypeOf<ParseDataType<'option<int>'>>().toEqualTypeOf<number | null>();
      expectTypeOf<ParseDataType<'option<bool>'>>().toEqualTypeOf<boolean | null>();
    });

    it('parses set types', () => {
      expectTypeOf<ParseDataType<'set<string>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseDataType<'set<int>'>>().toEqualTypeOf<number[]>();
    });

    it('parses record types', () => {
      expectTypeOf<ParseDataType<'record<user>'>>().toEqualTypeOf<RecordId<'user'>>();
    });

    it('parses record type without parameter', () => {
      expectTypeOf<ParseDataType<'record'>>().toEqualTypeOf<RecordId>();
    });

    it('parses geometry types', () => {
      expectTypeOf<ParseDataType<'geometry<point>'>>().toEqualTypeOf<PointGeometry>();
    });

    it('parses geometry subtypes', () => {
      expectTypeOf<ParseDataType<'geometry<point>'>>().toEqualTypeOf<PointGeometry>();
      expectTypeOf<ParseDataType<'geometry<linestring>'>>().toEqualTypeOf<LineStringGeometry>();
      expectTypeOf<ParseDataType<'geometry<polygon>'>>().toEqualTypeOf<PolygonGeometry>();
      expectTypeOf<ParseDataType<'geometry<multipoint>'>>().toEqualTypeOf<MultiPointGeometry>();
      expectTypeOf<
        ParseDataType<'geometry<multilinestring>'>
      >().toEqualTypeOf<MultiLineStringGeometry>();
      expectTypeOf<ParseDataType<'geometry<multipolygon>'>>().toEqualTypeOf<MultiPolygonGeometry>();
      expectTypeOf<ParseDataType<'geometry<collection>'>>().toEqualTypeOf<GeometryCollection>();
      // Unknown subtype falls back to Geometry
      expectTypeOf<ParseDataType<'geometry<unknown>'>>().toEqualTypeOf<Geometry>();
    });

    it('parses range types', () => {
      expectTypeOf<ParseDataType<'range<int>'>>().toEqualTypeOf<Range<number>>();
      expectTypeOf<ParseDataType<'range<float>'>>().toEqualTypeOf<Range<number>>();
      expectTypeOf<ParseDataType<'range<number>'>>().toEqualTypeOf<Range<number>>();
    });

    it('parses plain range type', () => {
      expectTypeOf<ParseDataType<'range'>>().toEqualTypeOf<Range>();
    });
  });

  describe('Combined types', () => {
    it('parses option array', () => {
      expectTypeOf<ParseDataType<'option<array<string>>'>>().toEqualTypeOf<string[] | null>();
    });

    it('parses array option', () => {
      expectTypeOf<ParseDataType<'array<option<string>>'>>().toEqualTypeOf<(string | null)[]>();
    });

    it('parses set array', () => {
      expectTypeOf<ParseDataType<'array<set<string>>'>>().toEqualTypeOf<string[][]>();
    });
  });

  describe('Record types with pipe separator', () => {
    it('parses record with single table', () => {
      expectTypeOf<ParseDataType<'record<user>'>>().toEqualTypeOf<RecordId<'user'>>();
    });

    it('parses record with union types', () => {
      type Result = ParseDataType<'record<user|post>'>;
      expectTypeOf<Result>().toEqualTypeOf<RecordId<'user'> | RecordId<'post'>>();
    });

    it('parses record with multiple union types', () => {
      type Result = ParseDataType<'record<user|post|comment>'>;
      expectTypeOf<Result>().toEqualTypeOf<
        RecordId<'user'> | RecordId<'post'> | RecordId<'comment'>
      >();
    });

    it('handles whitespace in union types', () => {
      type Result = ParseDataType<'record<user | post>'>;
      expectTypeOf<Result>().toEqualTypeOf<RecordId<'user'> | RecordId<'post'>>();
    });
  });

  describe('Array and Set with parameters', () => {
    it('parses array with max length parameter', () => {
      expectTypeOf<ParseDataType<'array<string, 100>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseDataType<'array<int, 50>'>>().toEqualTypeOf<number[]>();
    });

    it('parses set with max size parameter', () => {
      expectTypeOf<ParseDataType<'set<string, 100>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseDataType<'set<int, 50>'>>().toEqualTypeOf<number[]>();
    });

    it('parses nested types with parameters', () => {
      expectTypeOf<ParseDataType<'array<option<string>, 100>'>>().toEqualTypeOf<
        (string | null)[]
      >();
    });
  });

  describe('Edge cases', () => {
    it('handles whitespace in type names', () => {
      expectTypeOf<ParseDataType<'  string  '>>().toEqualTypeOf<string>();
      expectTypeOf<ParseDataType<'  array<string>  '>>().toEqualTypeOf<string[]>();
    });

    it('handles case variations', () => {
      expectTypeOf<ParseDataType<'STRING'>>().toEqualTypeOf<string>();
      expectTypeOf<ParseDataType<'Array<string>'>>().toEqualTypeOf<string[]>();
      expectTypeOf<ParseDataType<'OPTION<string>'>>().toEqualTypeOf<string | null>();
    });

    it('handles unknown types', () => {
      expectTypeOf<ParseDataType<'unknown_type'>>().toEqualTypeOf<unknown>();
    });

    it('handles deeply nested types within limit', () => {
      // 5 levels deep - should work
      expectTypeOf<ParseDataType<'array<array<array<array<array<string>>>>>>'>>().toEqualTypeOf<
        string[][][][][]
      >();
    });

    it('handles complex nested types', () => {
      // array<option<array<option<record<user>>>>> = ((RecordId<'user'> | null)[] | null)[]
      type Result = ParseDataType<'array<option<array<option<record<user>>>>>'>;
      type Expected = ((RecordId<'user'> | null)[] | null)[];
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });

  describe('Literal types', () => {
    it('parses number literal', () => {
      expectTypeOf<ParseDataType<'9'>>().toEqualTypeOf<9>();
      expectTypeOf<ParseDataType<'42'>>().toEqualTypeOf<42>();
      expectTypeOf<ParseDataType<'0'>>().toEqualTypeOf<0>();
    });

    it('parses string literal with double quotes', () => {
      expectTypeOf<ParseDataType<'"nine"'>>().toEqualTypeOf<'nine'>();
      expectTypeOf<ParseDataType<'"hello world"'>>().toEqualTypeOf<'hello world'>();
    });

    it('parses string literal with single quotes', () => {
      expectTypeOf<ParseDataType<"'nine'">>().toEqualTypeOf<'nine'>();
      expectTypeOf<ParseDataType<"'hello'">>().toEqualTypeOf<'hello'>();
    });

    it('parses union of number literals', () => {
      type Result = ParseDataType<'9 | 42 | 0'>;
      expectTypeOf<Result>().toEqualTypeOf<9 | 42 | 0>();
    });

    it('parses union of string literals', () => {
      type Result = ParseDataType<'"ok" | "error" | "pending"'>;
      expectTypeOf<Result>().toEqualTypeOf<'ok' | 'error' | 'pending'>();
    });

    it('parses mixed literal union', () => {
      type Result = ParseDataType<'9 | "9" | "nine"'>;
      expectTypeOf<Result>().toEqualTypeOf<9 | '9' | 'nine'>();
    });

    it('parses union of type and literal', () => {
      type Result = ParseDataType<'datetime | uuid | "N/A"'>;
      expectTypeOf<Result>().toEqualTypeOf<Datetime | UUID | 'N/A'>();
    });

    it('parses simple object literal', () => {
      type Result = ParseDataType<'{ error: string }'>;
      expectTypeOf<Result>().toEqualTypeOf<{ error: string }>();
    });

    it('parses object literal with multiple fields', () => {
      type Result = ParseDataType<'{ name: string, age: int }'>;
      expectTypeOf<Result>().toEqualTypeOf<{ name: string; age: number }>();
    });

    it('parses union of object literals', () => {
      type Result = ParseDataType<'{ ok: bool } | { error: string }'>;
      expectTypeOf<Result>().toEqualTypeOf<{ ok: boolean } | { error: string }>();
    });

    it('parses complex object union (SurrealDB error_info pattern)', () => {
      type Result =
        ParseDataType<'{ Continue: { message: string }} | { Retry: { after: duration }} | { Deprecated: { message: string }}'>;
      expectTypeOf<Result>().toEqualTypeOf<
        | { Continue: { message: string } }
        | { Retry: { after: Duration } }
        | { Deprecated: { message: string } }
      >();
    });

    it('parses object with nested types', () => {
      type Result = ParseDataType<'{ users: array<record<user>> }'>;
      expectTypeOf<Result>().toEqualTypeOf<{ users: RecordId<'user'>[] }>();
    });

    it('parses union with object and string literal', () => {
      type Result = ParseDataType<'"ok" | { error: string }'>;
      expectTypeOf<Result>().toEqualTypeOf<'ok' | { error: string }>();
    });
  });

  describe('Tuple types', () => {
    it('parses simple tuple', () => {
      type Result = ParseDataType<'[string, int]'>;
      expectTypeOf<Result>().toEqualTypeOf<[string, number]>();
    });

    it('parses tuple with three elements', () => {
      type Result = ParseDataType<'[string, int, bool]'>;
      expectTypeOf<Result>().toEqualTypeOf<[string, number, boolean]>();
    });

    it('parses tuple with nested types', () => {
      type Result = ParseDataType<'[array<string>, option<int>]'>;
      expectTypeOf<Result>().toEqualTypeOf<[string[], number | null]>();
    });

    it('parses tuple with object', () => {
      type Result = ParseDataType<'[string, { name: string }]'>;
      expectTypeOf<Result>().toEqualTypeOf<[string, { name: string }]>();
    });

    it('parses single element tuple', () => {
      type Result = ParseDataType<'[string]'>;
      expectTypeOf<Result>().toEqualTypeOf<[string]>();
    });

    it('parses tuple with record types', () => {
      type Result = ParseDataType<'[record<user>, string]'>;
      expectTypeOf<Result>().toEqualTypeOf<[RecordId<'user'>, string]>();
    });

    it('parses tuple in union with string', () => {
      type Result = ParseDataType<'[string, int] | "none"'>;
      expectTypeOf<Result>().toEqualTypeOf<[string, number] | 'none'>();
    });

    it('parses nested tuples', () => {
      type Result = ParseDataType<'[[string, int], bool]'>;
      expectTypeOf<Result>().toEqualTypeOf<[[string, number], boolean]>();
    });
  });

  describe('Literal type support', () => {
    it('parses literal<string>', () => {
      type Result = ParseDataType<'literal<"hello">'>;
      expectTypeOf<Result>().toEqualTypeOf<'hello'>();
    });

    it('parses literal<number>', () => {
      type Result = ParseDataType<'literal<42>'>;
      expectTypeOf<Result>().toEqualTypeOf<42>();
    });

    it('parses plain literal', () => {
      type Result = ParseDataType<'literal'>;
      expectTypeOf<Result>().toEqualTypeOf<string | number | boolean>();
    });
  });

  describe('Tokenizer validation', () => {
    it('accepts valid characters', () => {
      type Result = ParseDataType<'array<string>'>;
      expectTypeOf<Result>().toEqualTypeOf<string[]>();
    });

    it('accepts type with underscores', () => {
      type Result = ParseDataType<'record<my_table>'>;
      expectTypeOf<Result>().toEqualTypeOf<RecordId<'my_table'>>();
    });

    it('accepts type with dots', () => {
      type Result = ParseDataType<'record<schema.table>'>;
      expectTypeOf<Result>().toEqualTypeOf<RecordId<'schema.table'>>();
    });

    it('accepts whitespace', () => {
      type Result = ParseDataType<'  string  '>;
      expectTypeOf<Result>().toEqualTypeOf<string>();
    });
  });
});

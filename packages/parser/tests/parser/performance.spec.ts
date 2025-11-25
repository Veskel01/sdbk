import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseDataType } from '../../src';

describe('Type Performance and Depth Limits', () => {
  describe('Nested types within depth limit', () => {
    it('handles 5 levels of nesting', () => {
      type Result = ParseDataType<'array<array<array<array<array<string>>>>>'>;
      expectTypeOf<Result>().toEqualTypeOf<string[][][][][]>();
    });

    it('handles 8 levels of nesting', () => {
      type Result = ParseDataType<'array<array<array<array<array<array<array<array<string>>>>>>>>'>;
      expectTypeOf<Result>().toEqualTypeOf<string[][][][][][][][]>();
    });

    it('handles 9 levels of nesting (just under limit)', () => {
      type Result =
        ParseDataType<'array<array<array<array<array<array<array<array<array<string>>>>>>>>>'>;
      expectTypeOf<Result>().toEqualTypeOf<string[][][][][][][][][]>();
    });
  });

  describe('Complex nested types', () => {
    it('handles mixed array and option types', () => {
      type Result = ParseDataType<'option<array<option<string>>>'>;
      expectTypeOf<Result>().toEqualTypeOf<(string | null)[] | null>();
    });

    it('handles nested record types', () => {
      type Result = ParseDataType<'array<option<record<user>>>'>;
      type Expected = ({ readonly __table: 'user'; readonly __id: string } | null)[];
      expectTypeOf<Result>().toEqualTypeOf<Expected>();
    });
  });
});

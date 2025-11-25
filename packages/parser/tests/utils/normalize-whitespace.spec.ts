import { describe, expectTypeOf, it } from 'bun:test';
import type { NormalizeWhitespace } from '../../src/utils/string';

describe('NormalizeWhitespace', () => {
  it('normalizes multiple spaces', () => {
    type result1 = NormalizeWhitespace<'hello  world'>;
    type result2 = NormalizeWhitespace<'hello   world'>;
    type result3 = NormalizeWhitespace<'DEFINE  TABLE  user'>;

    expectTypeOf<result1>().toEqualTypeOf<'hello world'>();
    expectTypeOf<result2>().toEqualTypeOf<'hello world'>();
    expectTypeOf<result3>().toEqualTypeOf<'DEFINE TABLE user'>();
  });

  it('normalizes tabs', () => {
    type result1 = NormalizeWhitespace<'hello\tworld'>;
    type result2 = NormalizeWhitespace<'hello\t\tworld'>;

    expectTypeOf<result1>().toEqualTypeOf<'hello world'>();
    expectTypeOf<result2>().toEqualTypeOf<'hello world'>();
  });

  it('normalizes newlines', () => {
    type result1 = NormalizeWhitespace<'hello\nworld'>;
    type result2 = NormalizeWhitespace<'hello\n\nworld'>;

    expectTypeOf<result1>().toEqualTypeOf<'hello world'>();
    expectTypeOf<result2>().toEqualTypeOf<'hello world'>();
  });

  it('normalizes mixed whitespace', () => {
    type result1 = NormalizeWhitespace<'hello  \t  world'>;
    type result2 = NormalizeWhitespace<'hello\t\nworld'>;
    type result3 = NormalizeWhitespace<'DEFINE  \t  TABLE  \n  user'>;

    expectTypeOf<result1>().toEqualTypeOf<'hello world'>();
    expectTypeOf<result2>().toEqualTypeOf<'hello world'>();
    expectTypeOf<result3>().toEqualTypeOf<'DEFINE TABLE user'>();
  });

  it('handles complex cases', () => {
    type result = NormalizeWhitespace<'DEFINE    TABLE    user    SCHEMAFULL'>;

    expectTypeOf<result>().toEqualTypeOf<'DEFINE TABLE user SCHEMAFULL'>();
  });
});

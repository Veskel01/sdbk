import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE ANALYZER', () => {
  describe('Basic analyzer definitions', () => {
    it('extracts basic analyzer with tokenizers', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER my_analyzer TOKENIZERS blank
      `>;

      expectTypeOf<Schema['analyzers']['my_analyzer']>().toMatchTypeOf<{
        name: 'my_analyzer';
        tokenizers: ['blank'];
      }>();
    });

    it('extracts analyzer with multiple tokenizers', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER code_analyzer TOKENIZERS class,camel
      `>;

      expectTypeOf<Schema['analyzers']['code_analyzer']['tokenizers']>().toEqualTypeOf<
        ['class', 'camel']
      >();
    });
  });

  describe('Filters', () => {
    it('extracts analyzer with filters', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER ascii_analyzer TOKENIZERS class FILTERS lowercase,ascii
      `>;

      expectTypeOf<Schema['analyzers']['ascii_analyzer']['tokenizers']>().toEqualTypeOf<
        ['class']
      >();
      expectTypeOf<Schema['analyzers']['ascii_analyzer']['filters']>().toEqualTypeOf<
        ['lowercase', 'ascii']
      >();
    });

    it('extracts analyzer with parameterized filters', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER ngram_analyzer TOKENIZERS class FILTERS ngram(1,3)
      `>;

      expectTypeOf<Schema['analyzers']['ngram_analyzer']['filters']>().toEqualTypeOf<
        ['ngram(1,3)']
      >();
    });

    it('extracts analyzer with snowball filter', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER english TOKENIZERS class FILTERS snowball(english)
      `>;

      expectTypeOf<Schema['analyzers']['english']['filters']>().toEqualTypeOf<
        ['snowball(english)']
      >();
    });
  });

  describe('Function clause', () => {
    it('extracts analyzer with FUNCTION clause', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER backwards FUNCTION fn::backwardsify TOKENIZERS blank
      `>;

      expectTypeOf<
        Schema['analyzers']['backwards']['function']
      >().toEqualTypeOf<'fn::backwardsify'>();
      expectTypeOf<Schema['analyzers']['backwards']['tokenizers']>().toEqualTypeOf<['blank']>();
    });
  });

  describe('Modifiers', () => {
    it('extracts analyzer with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER OVERWRITE example TOKENIZERS blank
      `>;

      expectTypeOf<Schema['analyzers']['example']['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Schema['analyzers']['example']['ifNotExists']>().toEqualTypeOf<false>();
    });

    it('extracts analyzer with IF NOT EXISTS', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER IF NOT EXISTS example TOKENIZERS blank
      `>;

      expectTypeOf<Schema['analyzers']['example']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<Schema['analyzers']['example']['ifNotExists']>().toEqualTypeOf<true>();
    });
  });

  describe('Comments', () => {
    it('extracts analyzer with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER search TOKENIZERS blank COMMENT "Full text search analyzer"
      `>;

      expectTypeOf<
        Schema['analyzers']['search']['comment']
      >().toEqualTypeOf<'Full text search analyzer'>();
    });
  });

  describe('Complex analyzer definitions', () => {
    it('extracts complex analyzer with all options', () => {
      type Schema = ParseSchema<`
        DEFINE ANALYZER OVERWRITE autocomplete TOKENIZERS blank,class FILTERS lowercase,edgengram(2,10) COMMENT "Autocomplete analyzer"
      `>;

      type Analyzer = Schema['analyzers']['autocomplete'];
      expectTypeOf<Analyzer['name']>().toEqualTypeOf<'autocomplete'>();
      expectTypeOf<Analyzer['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Analyzer['tokenizers']>().toEqualTypeOf<['blank', 'class']>();
      expectTypeOf<Analyzer['filters']>().toEqualTypeOf<['lowercase', 'edgengram(2,10)']>();
      expectTypeOf<Analyzer['comment']>().toEqualTypeOf<'Autocomplete analyzer'>();
    });
  });
});

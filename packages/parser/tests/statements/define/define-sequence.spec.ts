import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE SEQUENCE', () => {
  describe('Basic sequence definitions', () => {
    it('extracts basic sequence definition', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE mySeq
      `>;

      expectTypeOf<Schema['sequences']['mySeq']['name']>().toEqualTypeOf<'mySeq'>();
      expectTypeOf<Schema['sequences']['mySeq']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<Schema['sequences']['mySeq']['ifNotExists']>().toEqualTypeOf<false>();
    });
  });

  describe('Sequence options', () => {
    it('extracts sequence with BATCH', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE mySeq BATCH 1000
      `>;

      expectTypeOf<Schema['sequences']['mySeq']['batch']>().toEqualTypeOf<1000>();
    });

    it('extracts sequence with START', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE mySeq START 100
      `>;

      expectTypeOf<Schema['sequences']['mySeq']['start']>().toEqualTypeOf<100>();
    });

    it('extracts sequence with TIMEOUT', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE mySeq TIMEOUT 5s
      `>;

      expectTypeOf<Schema['sequences']['mySeq']['timeout']>().toEqualTypeOf<'5s'>();
    });
  });

  describe('Modifiers', () => {
    it('extracts sequence with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE OVERWRITE mySeq
      `>;

      expectTypeOf<Schema['sequences']['mySeq']['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Schema['sequences']['mySeq']['ifNotExists']>().toEqualTypeOf<false>();
    });

    it('extracts sequence with IF NOT EXISTS', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE IF NOT EXISTS mySeq
      `>;

      expectTypeOf<Schema['sequences']['mySeq']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<Schema['sequences']['mySeq']['ifNotExists']>().toEqualTypeOf<true>();
    });
  });

  describe('Complex sequence definitions', () => {
    it('extracts sequence with all clauses', () => {
      type Schema = ParseSchema<`
        DEFINE SEQUENCE mySeq2 BATCH 1000 START 100 TIMEOUT 5s
      `>;

      expectTypeOf<Schema['sequences']['mySeq2']['name']>().toEqualTypeOf<'mySeq2'>();
      expectTypeOf<Schema['sequences']['mySeq2']['batch']>().toEqualTypeOf<1000>();
      expectTypeOf<Schema['sequences']['mySeq2']['start']>().toEqualTypeOf<100>();
      expectTypeOf<Schema['sequences']['mySeq2']['timeout']>().toEqualTypeOf<'5s'>();
    });
  });
});

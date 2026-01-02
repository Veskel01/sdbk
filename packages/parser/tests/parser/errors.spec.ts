import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseError, ParseErrors, ParseStatement } from '../../src';

describe('Parse Errors', () => {
  describe('Unknown statement types', () => {
    it('returns error for unknown DEFINE statement', () => {
      type Result = ParseStatement<'DEFINE INVALID user'>;
      expectTypeOf<Result>().toExtend<ParseError>();
      expectTypeOf<Result>().toExtend<ParseErrors.UnknownStatement>();
    });

    it('returns error for empty statement', () => {
      type Result = ParseStatement<''>;
      expectTypeOf<Result>().toExtend<ParseError>();
      expectTypeOf<Result>().toEqualTypeOf<ParseErrors.InvalidSyntax>();
    });

    it('returns error for invalid syntax', () => {
      type Result = ParseStatement<'INVALID SYNTAX'>;
      expectTypeOf<Result>().toEqualTypeOf<ParseErrors.InvalidSyntax>();
    });
  });

  describe('Valid statements do not return errors', () => {
    it('parses valid TABLE statement', () => {
      type Result = ParseStatement<'DEFINE TABLE user'>;
      expectTypeOf<Result>().not.toEqualTypeOf<ParseErrors.UnknownStatement>();
      expectTypeOf<Result>().not.toEqualTypeOf<ParseErrors.InvalidSyntax>();
      expectTypeOf<Result>().toExtend<{ kind: 'table' }>();
    });

    it('parses valid FIELD statement', () => {
      type Result = ParseStatement<'DEFINE FIELD name ON user TYPE string'>;
      expectTypeOf<Result>().not.toEqualTypeOf<ParseErrors.UnknownStatement>();
      expectTypeOf<Result>().not.toEqualTypeOf<ParseErrors.InvalidSyntax>();
      expectTypeOf<Result>().toExtend<{ kind: 'field' }>();
    });
  });
});

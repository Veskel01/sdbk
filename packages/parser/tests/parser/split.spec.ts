import { describe, expectTypeOf, it } from 'bun:test';
import type { SplitStatements } from '../../src';

describe('SplitStatements', () => {
  it('splits by semicolon', () => {
    type result = SplitStatements<'DEFINE TABLE user; DEFINE FIELD name ON user'>;

    expectTypeOf<result>().toEqualTypeOf<['DEFINE TABLE user', 'DEFINE FIELD name ON user']>();
  });

  it('handles trailing semicolon', () => {
    type result = SplitStatements<'DEFINE TABLE user;'>;

    expectTypeOf<result>().toEqualTypeOf<['DEFINE TABLE user']>();
  });

  it('trims whitespace', () => {
    type result = SplitStatements<'  DEFINE TABLE user  ;  DEFINE FIELD name ON user  '>;

    expectTypeOf<result>().toEqualTypeOf<['DEFINE TABLE user', 'DEFINE FIELD name ON user']>();
  });

  it('handles multiple statements', () => {
    type result = SplitStatements<'DEFINE TABLE user; DEFINE TABLE post; DEFINE TABLE comment'>;

    expectTypeOf<result>().toEqualTypeOf<
      ['DEFINE TABLE user', 'DEFINE TABLE post', 'DEFINE TABLE comment']
    >();
  });

  it('handles empty string', () => {
    type result = SplitStatements<''>;

    expectTypeOf<result>().toEqualTypeOf<[]>();
  });

  it('handles only whitespace', () => {
    type result = SplitStatements<'   '>;

    expectTypeOf<result>().toEqualTypeOf<[]>();
  });

  it('handles statements with braces', () => {
    type result = SplitStatements<`
      DEFINE FUNCTION fn::test() { RETURN true; };
      DEFINE TABLE user
    `>;

    // Verify it's an array of strings
    expectTypeOf<result>().toExtend<string[]>();
    expectTypeOf<result[0]>().toExtend<string>();
    expectTypeOf<result[1]>().toExtend<string>();
  });

  it('handles nested braces', () => {
    type result = SplitStatements<`
      DEFINE FUNCTION fn::complex() {
        IF $value > 10 {
          RETURN true;
        }
      };
      DEFINE TABLE user
    `>;

    // Verify it's an array of strings
    expectTypeOf<result>().toExtend<string[]>();
    expectTypeOf<result[0]>().toExtend<string>();
    expectTypeOf<result[1]>().toExtend<string>();
  });

  it('handles statements with comments', () => {
    type result = SplitStatements<`
      -- This is a comment
      DEFINE TABLE user;
      /* Multi-line comment */
      DEFINE TABLE post
    `>;

    // Verify it's an array of strings
    expectTypeOf<result>().toExtend<string[]>();
    expectTypeOf<result[0]>().toExtend<string>();
    expectTypeOf<result[1]>().toExtend<string>();
  });

  it('handles complex real-world schema', () => {
    type result = SplitStatements<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE FIELD email ON user TYPE string;
      DEFINE TABLE post SCHEMAFULL;
      DEFINE FIELD id ON post TYPE string READONLY;
      DEFINE FIELD title ON post TYPE string;
      DEFINE INDEX idx_post_title ON post FIELDS title
    `>;

    // Verify it's an array of strings
    expectTypeOf<result>().toExtend<string[]>();
    expectTypeOf<result[0]>().toExtend<string>();
    expectTypeOf<result[6]>().toExtend<string>();
  });
});

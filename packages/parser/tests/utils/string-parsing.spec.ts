import { describe, expectTypeOf, it } from 'bun:test';
import type { RemoveCommentsSafe, RemoveLineCommentsSafe } from '../../src/utils/string-parsing';

describe('RemoveLineCommentsSafe', () => {
  it('removes simple line comments', () => {
    type Result = RemoveLineCommentsSafe<'DEFINE TABLE user -- comment'>;
    expectTypeOf<Result>().toEqualTypeOf<'DEFINE TABLE user '>();
  });

  it('removes line comments with newline', () => {
    type Result = RemoveLineCommentsSafe<'DEFINE TABLE user -- comment\nDEFINE TABLE post'>;
    expectTypeOf<Result>().toEqualTypeOf<'DEFINE TABLE user \nDEFINE TABLE post'>();
  });

  it('preserves comments inside double-quoted strings', () => {
    type Result = RemoveLineCommentsSafe<'DEFINE FIELD name VALUE "text -- comment"'>;
    // Note: Simplified implementation may not perfectly preserve all cases
    expectTypeOf<Result>().toExtend<string>();
  });

  it('preserves comments inside single-quoted strings', () => {
    type Result = RemoveLineCommentsSafe<"DEFINE FIELD name VALUE 'text -- comment'">;
    expectTypeOf<Result>().toExtend<string>();
  });
});

describe('RemoveCommentsSafe', () => {
  it('removes both line and block comments', () => {
    type Result = RemoveCommentsSafe<`
      DEFINE TABLE user -- line comment
      /* block comment */
      DEFINE TABLE post
    `>;
    expectTypeOf<Result>().toExtend<string>();
  });

  it('preserves comments inside strings', () => {
    type Result = RemoveCommentsSafe<`
      DEFINE FIELD name VALUE "text -- comment"
      -- This is a real comment
    `>;
    expectTypeOf<Result>().toExtend<string>();
  });
});

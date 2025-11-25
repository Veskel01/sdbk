import type { AfterFirstWord, FirstWord, Trim, Upper } from '../../utils';

/**
 * JWT algorithm types supported by SurrealDB.
 */
export type JwtAlgorithm =
  | 'EDDSA'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'RS256'
  | 'RS384'
  | 'RS512';

/**
 * Bearer target type - specifies whether the bearer token is for a user or record.
 */
export type BearerTarget = 'user' | 'record';

/**
 * Duration configuration for access methods.
 */
export interface AccessDuration<
  Grant extends string | undefined = string | undefined,
  Token extends string | undefined = string | undefined,
  Session extends string | undefined = string | undefined
> {
  grant: Grant;
  token: Token;
  session: Session;
}

/**
 * JWT configuration - either algorithm+key or URL.
 */
export interface JwtConfig<
  Algorithm extends JwtAlgorithm | undefined = JwtAlgorithm | undefined,
  Key extends string | undefined = string | undefined,
  Url extends string | undefined = string | undefined
> {
  algorithm: Algorithm;
  key: Key;
  url: Url;
}

/**
 * Record access JWT configuration with optional issuer.
 */
export interface RecordJwtConfig<
  Algorithm extends JwtAlgorithm | undefined = JwtAlgorithm | undefined,
  Key extends string | undefined = string | undefined,
  Url extends string | undefined = string | undefined,
  IssuerKey extends string | undefined = string | undefined
> {
  algorithm: Algorithm;
  key: Key;
  url: Url;
  issuerKey: IssuerKey;
}

/**
 * Base access result interface.
 */
interface AccessResultBase<
  Name extends string = string,
  Level extends 'root' | 'namespace' | 'database' = 'root' | 'namespace' | 'database',
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'access';
  name: Name;
  level: Level;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

/**
 * Result of parsing a DEFINE ACCESS ... TYPE BEARER statement.
 */
export interface BearerAccessResult<
  Name extends string = string,
  Level extends 'namespace' | 'database' = 'namespace' | 'database',
  BearerFor extends BearerTarget = BearerTarget,
  Authenticate extends string | undefined = string | undefined,
  Duration extends AccessDuration | undefined = AccessDuration | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> extends AccessResultBase<Name, Level, Overwrite, IfNotExists> {
  accessType: 'bearer';
  bearerFor: BearerFor;
  authenticate: Authenticate;
  duration: Duration;
}

/**
 * Result of parsing a DEFINE ACCESS ... TYPE JWT statement.
 */
export interface JwtAccessResult<
  Name extends string = string,
  Level extends 'root' | 'namespace' | 'database' = 'root' | 'namespace' | 'database',
  Jwt extends JwtConfig = JwtConfig,
  Authenticate extends string | undefined = string | undefined,
  SessionDuration extends string | undefined = string | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> extends AccessResultBase<Name, Level, Overwrite, IfNotExists> {
  accessType: 'jwt';
  jwt: Jwt;
  authenticate: Authenticate;
  sessionDuration: SessionDuration;
}

/**
 * Result of parsing a DEFINE ACCESS ... TYPE RECORD statement.
 */
export interface RecordAccessResult<
  Name extends string = string,
  Signup extends string | undefined = string | undefined,
  Signin extends string | undefined = string | undefined,
  Jwt extends RecordJwtConfig | undefined = RecordJwtConfig | undefined,
  WithRefresh extends boolean = false,
  Authenticate extends string | undefined = string | undefined,
  Duration extends AccessDuration | undefined = AccessDuration | undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> extends AccessResultBase<Name, 'database', Overwrite, IfNotExists> {
  accessType: 'record';
  signup: Signup;
  signin: Signin;
  jwt: Jwt;
  withRefresh: WithRefresh;
  authenticate: Authenticate;
  duration: Duration;
}

/**
 * Union of all access result types.
 */
export type AccessResult = BearerAccessResult | JwtAccessResult | RecordAccessResult;

export type ParseDefineAccess<S extends string> = _ParseAccess<Trim<S>>;

type _ParseAccess<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'ACCESS'
      ? _AccessBody<Trim<C>>
      : never
    : never
  : never;

type _AccessBody<S extends string> = _ExtractNameAndModifiers<S> extends {
  name: infer AName extends string;
  rest: infer Rest extends string;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? _ExtractAccessLevel<Rest> extends {
      level: infer L extends 'root' | 'namespace' | 'database';
      rest: infer R extends string;
    }
    ? _DispatchByType<AName, L, R, OW, INE>
    : never
  : never;

/**
 * Dispatch to appropriate parser based on TYPE.
 */
type _DispatchByType<
  Name extends string,
  Level extends 'root' | 'namespace' | 'database',
  S extends string,
  OW extends boolean,
  INE extends boolean
> = Upper<S> extends `${string}TYPE BEARER${string}`
  ? _ParseBearerAccess<Name, Level, S, OW, INE>
  : Upper<S> extends `${string}TYPE JWT${string}`
    ? _ParseJwtAccess<Name, Level, S, OW, INE>
    : Upper<S> extends `${string}TYPE RECORD${string}`
      ? _ParseRecordAccess<Name, S, OW, INE>
      : never;

type _ParseBearerAccess<
  Name extends string,
  Level extends 'root' | 'namespace' | 'database',
  S extends string,
  OW extends boolean,
  INE extends boolean
> = Level extends 'namespace' | 'database'
  ? BearerAccessResult<
      Name,
      Level,
      _ExtractBearerFor<S>,
      _ExtractAuthenticate<S>,
      _ExtractFullDuration<S>,
      OW,
      INE
    >
  : never; // Bearer not allowed on ROOT

type _ExtractBearerFor<S extends string> = Upper<S> extends `${string}FOR USER${string}`
  ? 'user'
  : Upper<S> extends `${string}FOR RECORD${string}`
    ? 'record'
    : 'user'; // Default to user

type _ParseJwtAccess<
  Name extends string,
  Level extends 'root' | 'namespace' | 'database',
  S extends string,
  OW extends boolean,
  INE extends boolean
> = JwtAccessResult<
  Name,
  Level,
  _ExtractJwtConfig<S>,
  _ExtractAuthenticate<S>,
  _ExtractSessionDurationFromOriginal<S>,
  OW,
  INE
>;

type _ExtractJwtConfig<S extends string> = Upper<S> extends `${string}ALGORITHM ${string}`
  ? _ParseJwtAlgorithmKey<S>
  : Upper<S> extends `${string}URL ${string}`
    ? { algorithm: undefined; key: undefined; url: _ExtractAfterKeyword<S, 'URL'> }
    : { algorithm: undefined; key: undefined; url: undefined };

type _ParseJwtAlgorithmKey<S extends string> = {
  algorithm: _ExtractAlgorithmFromOriginal<S>;
  key: Upper<S> extends `${string}KEY ${string}` ? _ExtractAfterKeyword<S, 'KEY'> : undefined;
  url: undefined;
};

type _ExtractAlgorithmFromOriginal<S extends string> = _ExtractAfterKeyword<
  S,
  'ALGORITHM'
> extends infer Alg extends string
  ? Upper<Alg> extends JwtAlgorithm
    ? Upper<Alg>
    : undefined
  : undefined;

type _ExtractSessionDurationFromOriginal<S extends string> =
  Upper<S> extends `${string}DURATION FOR SESSION ${string}`
    ? _ExtractAfterKeywords<S, 'DURATION FOR SESSION'>
    : undefined;

type _ParseRecordAccess<
  Name extends string,
  S extends string,
  OW extends boolean,
  INE extends boolean
> = RecordAccessResult<
  Name,
  _ExtractSignup<S>,
  _ExtractSignin<S>,
  _ExtractRecordJwtConfig<S>,
  _HasWithRefresh<S>,
  _ExtractAuthenticate<S>,
  _ExtractRecordDuration<S>,
  OW,
  INE
>;

type _ExtractSignup<S extends string> = Upper<S> extends `${string}SIGNUP ${string}`
  ? _ExtractExpressionAfterKeyword<S, 'SIGNUP'>
  : undefined;

type _ExtractSignin<S extends string> = Upper<S> extends `${string}SIGNIN ${string}`
  ? _ExtractExpressionAfterKeyword<S, 'SIGNIN'>
  : undefined;

type _ExtractRecordJwtConfig<S extends string> = Upper<S> extends `${string}WITH JWT${string}`
  ? {
      algorithm: Upper<S> extends `${string}ALGORITHM ${string}`
        ? _ExtractAlgorithmFromOriginal<S>
        : undefined;
      key: Upper<S> extends `${string}KEY ${string}` ? _ExtractKeyFromOriginal<S> : undefined;
      url: Upper<S> extends `${string}URL ${string}` ? _ExtractAfterKeyword<S, 'URL'> : undefined;
      issuerKey: Upper<S> extends `${string}WITH ISSUER KEY ${string}`
        ? _ExtractAfterKeywords<S, 'WITH ISSUER KEY'>
        : undefined;
    }
  : undefined;

type _ExtractKeyFromOriginal<S extends string> = Upper<S> extends `${string}WITH ISSUER${string}`
  ? _ExtractValueBeforeKeywordFromOriginal<S, 'KEY', 'WITH'>
  : _ExtractAfterKeyword<S, 'KEY'>;

type _HasWithRefresh<S extends string> = Upper<S> extends `${string}WITH REFRESH${string}`
  ? true
  : false;

type _ExtractRecordDuration<S extends string> = Upper<S> extends `${string}DURATION${string}`
  ? {
      grant: undefined; // Record access doesn't have grant
      token: Upper<S> extends `${string}FOR TOKEN ${string}`
        ? _ExtractAfterKeywords<S, 'FOR TOKEN'>
        : undefined;
      session: Upper<S> extends `${string}FOR SESSION ${string}`
        ? _ExtractAfterKeywords<S, 'FOR SESSION'>
        : undefined;
    }
  : undefined;

/**
 * Extract name and modifiers (OVERWRITE, IF NOT EXISTS).
 */
type _ExtractNameAndModifiers<S extends string> = Upper<FirstWord<S>> extends 'OVERWRITE'
  ? {
      name: FirstWord<AfterFirstWord<S>>;
      rest: AfterFirstWord<AfterFirstWord<S>>;
      overwrite: true;
      ifNotExists: false;
    }
  : Upper<S> extends `IF NOT EXISTS ${string}`
    ? _ExtractAfterIfNotExists<S>
    : {
        name: FirstWord<S>;
        rest: AfterFirstWord<S>;
        overwrite: false;
        ifNotExists: false;
      };

type _ExtractAfterIfNotExists<S extends string> =
  S extends `${string} ${string} ${string} ${infer Rest}`
    ? {
        name: FirstWord<Trim<Rest>>;
        rest: AfterFirstWord<Trim<Rest>>;
        overwrite: false;
        ifNotExists: true;
      }
    : never;

/**
 * Extract ON ROOT/NAMESPACE/DATABASE.
 */
type _ExtractAccessLevel<S extends string> = Upper<FirstWord<S>> extends 'ON'
  ? Upper<FirstWord<AfterFirstWord<S>>> extends 'ROOT'
    ? { level: 'root'; rest: AfterFirstWord<AfterFirstWord<S>> }
    : Upper<FirstWord<AfterFirstWord<S>>> extends 'NAMESPACE'
      ? { level: 'namespace'; rest: AfterFirstWord<AfterFirstWord<S>> }
      : Upper<FirstWord<AfterFirstWord<S>>> extends 'DATABASE'
        ? { level: 'database'; rest: AfterFirstWord<AfterFirstWord<S>> }
        : { level: 'database'; rest: S }
  : { level: 'database'; rest: S };

/**
 * Extract AUTHENTICATE expression from original string.
 */
type _ExtractAuthenticate<S extends string> = Upper<S> extends `${string}AUTHENTICATE ${string}`
  ? _ExtractExpressionAfterKeyword<S, 'AUTHENTICATE'>
  : undefined;

/**
 * Extract full DURATION configuration (for BEARER).
 */
type _ExtractFullDuration<S extends string> = Upper<S> extends `${string}DURATION${string}`
  ? {
      grant: Upper<S> extends `${string}FOR GRANT ${string}`
        ? _ExtractAfterKeywords<S, 'FOR GRANT'>
        : undefined;
      token: Upper<S> extends `${string}FOR TOKEN ${string}`
        ? _ExtractAfterKeywords<S, 'FOR TOKEN'>
        : undefined;
      session: Upper<S> extends `${string}FOR SESSION ${string}`
        ? _ExtractAfterKeywords<S, 'FOR SESSION'>
        : undefined;
    }
  : undefined;

/**
 * Extract value after a keyword, preserving original case.
 * Searches for the keyword case-insensitively but returns the original value.
 */
type _ExtractAfterKeyword<S extends string, Keyword extends string> = _FindKeywordPosition<
  S,
  Keyword
> extends infer Pos
  ? Pos extends { after: infer After extends string }
    ? FirstWord<Trim<After>>
    : undefined
  : undefined;

/**
 * Extract value after multiple keywords (e.g., "FOR GRANT").
 */
type _ExtractAfterKeywords<S extends string, Keywords extends string> = _FindKeywordsPosition<
  S,
  Keywords
> extends infer Pos
  ? Pos extends { after: infer After extends string }
    ? FirstWord<Trim<After>>
    : undefined
  : undefined;

/**
 * Find position of a keyword in string (case-insensitive).
 * Optimized: tries direct pattern matching first, then falls back to word-by-word search.
 */
type _FindKeywordPosition<S extends string, Keyword extends string> = Upper<S> extends `${
  string // Quick check: does the keyword exist at all?
} ${Upper<Keyword>} ${string}`
  ? // Try direct extraction using Upper<S> position
    _ExtractAtKeyword<S, Keyword>
  : Upper<S> extends `${string} ${Upper<Keyword>}`
    ? _ExtractAtKeywordEnd<S, Keyword>
    : undefined;

// Extract using the position found in Upper<S>
type _ExtractAtKeyword<
  S extends string,
  Keyword extends string
> = Upper<S> extends `${infer UBefore} ${Upper<Keyword>}`
  ? // UBefore length tells us where keyword is
    _SplitAtLength<S, _StringLength<UBefore>> extends [
      infer Before extends string,
      infer Rest extends string
    ]
    ? Rest extends ` ${infer _Kw} ${infer After}`
      ? { before: Before; after: After }
      : _FindKeywordPositionSlow<S, Keyword>
    : _FindKeywordPositionSlow<S, Keyword>
  : _FindKeywordPositionSlow<S, Keyword>;

type _ExtractAtKeywordEnd<
  S extends string,
  Keyword extends string
> = Upper<S> extends `${infer UBefore} ${Upper<Keyword>}`
  ? _SplitAtLength<S, _StringLength<UBefore>> extends [infer Before extends string, string]
    ? { before: Before; after: '' }
    : _FindKeywordPositionSlow<S, Keyword>
  : _FindKeywordPositionSlow<S, Keyword>;

// Get string length (limited to avoid deep recursion)
type _StringLength<S extends string, Acc extends unknown[] = []> = Acc['length'] extends 200
  ? 200
  : S extends `${string}${infer Rest}`
    ? _StringLength<Rest, [...Acc, unknown]>
    : Acc['length'];

// Split string at position
type _SplitAtLength<
  S extends string,
  Pos extends number,
  Acc extends string = '',
  Count extends unknown[] = []
> = Count['length'] extends Pos
  ? [Acc, S]
  : S extends `${infer C}${infer Rest}`
    ? _SplitAtLength<Rest, Pos, `${Acc}${C}`, [...Count, unknown]>
    : [Acc, ''];

// Fallback: Search for keyword word by word (with higher limit)
type _FindKeywordPositionSlow<
  S extends string,
  Keyword extends string,
  Depth extends unknown[] = []
> = Depth['length'] extends 50
  ? undefined // Limit recursion depth
  : S extends `${infer Before} ${infer Word} ${infer After}`
    ? Upper<Word> extends Upper<Keyword>
      ? { before: Before; after: After }
      : _FindKeywordPositionSlow<
            `${Word} ${After}`,
            Keyword,
            [...Depth, unknown]
          > extends infer Result
        ? Result extends { before: infer B extends string; after: infer A extends string }
          ? { before: `${Before} ${B}`; after: A }
          : undefined
        : undefined
    : S extends `${infer Before} ${infer Word}`
      ? Upper<Word> extends Upper<Keyword>
        ? { before: Before; after: '' }
        : undefined
      : undefined;

/**
 * Find position of multiple keywords (e.g., "FOR GRANT").
 */
type _FindKeywordsPosition<
  S extends string,
  Keywords extends string
> = Keywords extends `${infer K1} ${infer K2} ${infer K3}`
  ? _FindThreeKeywords<S, K1, K2, K3>
  : Keywords extends `${infer K1} ${infer K2}`
    ? _FindTwoKeywords<S, K1, K2>
    : _FindKeywordPosition<S, Keywords>;

type _FindTwoKeywords<
  S extends string,
  K1 extends string,
  K2 extends string
> = Upper<S> extends `${string} ${Upper<K1>} ${Upper<K2>} ${string}`
  ? _FindTwoKeywordsSlow<S, K1, K2>
  : undefined;

type _FindTwoKeywordsSlow<
  S extends string,
  K1 extends string,
  K2 extends string,
  Depth extends unknown[] = []
> = Depth['length'] extends 40
  ? undefined
  : S extends `${infer Before} ${infer W1} ${infer W2} ${infer After}`
    ? Upper<W1> extends Upper<K1>
      ? Upper<W2> extends Upper<K2>
        ? { before: Before; after: After }
        : _FindTwoKeywordsSlow<`${W1} ${W2} ${After}`, K1, K2, [...Depth, unknown]> extends infer R
          ? R extends { before: infer B extends string; after: infer A extends string }
            ? { before: `${Before} ${B}`; after: A }
            : undefined
          : undefined
      : _FindTwoKeywordsSlow<`${W1} ${W2} ${After}`, K1, K2, [...Depth, unknown]> extends infer R
        ? R extends { before: infer B extends string; after: infer A extends string }
          ? { before: `${Before} ${B}`; after: A }
          : undefined
        : undefined
    : undefined;

type _FindThreeKeywords<
  S extends string,
  K1 extends string,
  K2 extends string,
  K3 extends string
> = Upper<S> extends `${string} ${Upper<K1>} ${Upper<K2>} ${Upper<K3>} ${string}`
  ? _FindThreeKeywordsSlow<S, K1, K2, K3>
  : undefined;

type _FindThreeKeywordsSlow<
  S extends string,
  K1 extends string,
  K2 extends string,
  K3 extends string,
  Depth extends unknown[] = []
> = Depth['length'] extends 40
  ? undefined
  : S extends `${infer Before} ${infer W1} ${infer W2} ${infer W3} ${infer After}`
    ? Upper<W1> extends Upper<K1>
      ? Upper<W2> extends Upper<K2>
        ? Upper<W3> extends Upper<K3>
          ? { before: Before; after: After }
          : _FindThreeKeywordsSlow<
                `${W1} ${W2} ${W3} ${After}`,
                K1,
                K2,
                K3,
                [...Depth, unknown]
              > extends infer R
            ? R extends { before: infer B extends string; after: infer A extends string }
              ? { before: `${Before} ${B}`; after: A }
              : undefined
            : undefined
        : _FindThreeKeywordsSlow<
              `${W1} ${W2} ${W3} ${After}`,
              K1,
              K2,
              K3,
              [...Depth, unknown]
            > extends infer R
          ? R extends { before: infer B extends string; after: infer A extends string }
            ? { before: `${Before} ${B}`; after: A }
            : undefined
          : undefined
      : _FindThreeKeywordsSlow<
            `${W1} ${W2} ${W3} ${After}`,
            K1,
            K2,
            K3,
            [...Depth, unknown]
          > extends infer R
        ? R extends { before: infer B extends string; after: infer A extends string }
          ? { before: `${Before} ${B}`; after: A }
          : undefined
        : undefined
    : undefined;

/**
 * Extract expression after keyword until next major keyword.
 */
type _ExtractExpressionAfterKeyword<
  S extends string,
  Keyword extends string
> = _FindKeywordPosition<S, Keyword> extends { after: infer After extends string }
  ? _TrimToNextKeyword<After>
  : undefined;

/**
 * Trim expression to next major keyword.
 */
type _TrimToNextKeyword<S extends string> = _FindNextKeywordBoundary<S> extends infer Boundary
  ? Boundary extends { expr: infer E extends string }
    ? Trim<E>
    : Trim<S>
  : Trim<S>;

type _FindNextKeywordBoundary<S extends string> = S extends `${infer Before} SIGNIN ${string}`
  ? { expr: Trim<Before> }
  : S extends `${infer Before} signin ${string}`
    ? { expr: Trim<Before> }
    : S extends `${infer Before} SIGNUP ${string}`
      ? { expr: Trim<Before> }
      : S extends `${infer Before} signup ${string}`
        ? { expr: Trim<Before> }
        : S extends `${infer Before} WITH ${string}`
          ? { expr: Trim<Before> }
          : S extends `${infer Before} with ${string}`
            ? { expr: Trim<Before> }
            : S extends `${infer Before} AUTHENTICATE ${string}`
              ? { expr: Trim<Before> }
              : S extends `${infer Before} authenticate ${string}`
                ? { expr: Trim<Before> }
                : S extends `${infer Before} DURATION ${string}`
                  ? { expr: Trim<Before> }
                  : S extends `${infer Before} duration ${string}`
                    ? { expr: Trim<Before> }
                    : S extends `${infer Before} COMMENT ${string}`
                      ? { expr: Trim<Before> }
                      : S extends `${infer Before} comment ${string}`
                        ? { expr: Trim<Before> }
                        : undefined;

/**
 * Extract value between a keyword and another keyword.
 */
type _ExtractValueBeforeKeywordFromOriginal<
  S extends string,
  StartKeyword extends string,
  EndKeyword extends string
> = _FindKeywordPosition<S, StartKeyword> extends { after: infer After extends string }
  ? _ExtractUntilKeyword<After, EndKeyword>
  : undefined;

type _ExtractUntilKeyword<
  S extends string,
  Keyword extends string
> = S extends `${infer Before} ${infer Word} ${infer _Rest}`
  ? Upper<Word> extends Upper<Keyword>
    ? FirstWord<Trim<Before>>
    : _ExtractUntilKeyword<`${Word} ${_Rest}`, Keyword> extends infer R
      ? R
      : FirstWord<Trim<S>>
  : FirstWord<Trim<S>>;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    ACCESS: ParseDefineAccess<S>;
  }
}

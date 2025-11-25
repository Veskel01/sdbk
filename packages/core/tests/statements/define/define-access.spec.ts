import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE ACCESS', () => {
  describe('Bearer access', () => {
    it('parses basic bearer access for user', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS api_token ON DATABASE TYPE BEARER FOR USER
      `>;

      expectTypeOf<Schema['accesses']['api_token']>().toMatchTypeOf<{
        name: 'api_token';
        level: 'database';
        accessType: 'bearer';
        bearerFor: 'user';
      }>();
    });

    it('parses bearer access for record', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS record_token ON NAMESPACE TYPE BEARER FOR RECORD
      `>;

      expectTypeOf<Schema['accesses']['record_token']>().toMatchTypeOf<{
        name: 'record_token';
        level: 'namespace';
        accessType: 'bearer';
        bearerFor: 'record';
      }>();
    });

    it('parses bearer access with DURATION', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS api ON DATABASE TYPE BEARER FOR USER DURATION FOR GRANT 1h FOR TOKEN 15m FOR SESSION 24h
      `>;

      type Access = Schema['accesses']['api'];
      expectTypeOf<Access['duration']>().toMatchTypeOf<{
        grant: '1h';
        token: '15m';
        session: '24h';
      }>();
    });

    it('parses bearer access with AUTHENTICATE', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS api ON DATABASE TYPE BEARER FOR USER AUTHENTICATE $token != NONE
      `>;

      expectTypeOf<Schema['accesses']['api']['authenticate']>().toEqualTypeOf<'$token != NONE'>();
    });
  });

  describe('JWT access', () => {
    it('parses basic JWT access', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT
      `>;

      expectTypeOf<Schema['accesses']['jwt_auth']>().toMatchTypeOf<{
        name: 'jwt_auth';
        level: 'database';
        accessType: 'jwt';
      }>();
    });

    it('parses JWT access on ROOT', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS root_jwt ON ROOT TYPE JWT
      `>;

      expectTypeOf<Schema['accesses']['root_jwt']['level']>().toEqualTypeOf<'root'>();
    });

    it('parses JWT access with ALGORITHM and KEY', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT ALGORITHM HS256 KEY "secret"
      `>;

      type Access = Schema['accesses']['jwt_auth'];
      expectTypeOf<Access['jwt']>().toMatchTypeOf<{
        algorithm: 'HS256';
        key: '"secret"';
      }>();
    });

    it('parses JWT access with URL', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT URL "https://auth.example.com/.well-known/jwks.json"
      `>;

      type Access = Schema['accesses']['jwt_auth'];
      expectTypeOf<
        Access['jwt']['url']
      >().toEqualTypeOf<'"https://auth.example.com/.well-known/jwks.json"'>();
    });

    it('parses JWT access with session duration', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT DURATION FOR SESSION 24h
      `>;

      expectTypeOf<Schema['accesses']['jwt_auth']['sessionDuration']>().toEqualTypeOf<'24h'>();
    });
  });

  describe('Record access', () => {
    it('parses basic record access', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS account ON DATABASE TYPE RECORD
      `>;

      expectTypeOf<Schema['accesses']['account']>().toExtend<{
        name: 'account';
        level: 'database';
        accessType: 'record';
      }>();
    });

    it('parses record access with SIGNUP and SIGNIN', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS account ON DATABASE TYPE RECORD
          SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
          SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
      `>;

      type Access = Schema['accesses']['account'];
      expectTypeOf<Access['signup']>().toExtend<string>();
      expectTypeOf<Access['signin']>().toExtend<string>();
    });

    it('parses record access with WITH REFRESH', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS account ON DATABASE TYPE RECORD WITH REFRESH
      `>;

      expectTypeOf<Schema['accesses']['account']['withRefresh']>().toEqualTypeOf<true>();
    });

    it('parses record access with JWT configuration', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS account ON DATABASE TYPE RECORD
          WITH JWT ALGORITHM RS256 KEY "public-key"
      `>;

      type Access = Schema['accesses']['account'];
      expectTypeOf<Access['jwt']>().toExtend<{
        algorithm: 'RS256';
        key: string;
      }>();
    });

    it('parses record access with JWT and ISSUER KEY', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS account ON DATABASE TYPE RECORD
          WITH JWT ALGORITHM RS256 KEY "public-key" WITH ISSUER KEY "issuer-key"
      `>;

      type Access = Schema['accesses']['account'];
      expectTypeOf<Access['jwt']>().toExtend<{
        issuerKey: string;
      }>();
    });

    it('parses record access with DURATION', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS account ON DATABASE TYPE RECORD DURATION FOR TOKEN 15m FOR SESSION 24h
      `>;

      type Access = Schema['accesses']['account'];
      expectTypeOf<Access['duration']>().toExtend<{
        token: '15m';
        session: '24h';
      }>();
    });

    it('parses full record access definition', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS OVERWRITE account ON DATABASE TYPE RECORD
          SIGNUP ( CREATE user SET email = $email )
          SIGNIN ( SELECT * FROM user WHERE email = $email )
          WITH JWT ALGORITHM HS512 KEY "secret"
          WITH REFRESH
          AUTHENTICATE $session.user != NONE
          DURATION FOR TOKEN 15m FOR SESSION 12h
      `>;

      type Access = Schema['accesses']['account'];
      expectTypeOf<Access['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Access['accessType']>().toEqualTypeOf<'record'>();
      expectTypeOf<Access['withRefresh']>().toEqualTypeOf<true>();
    });
  });

  describe('Modifiers', () => {
    it('parses bearer access with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS OVERWRITE my_bearer ON DATABASE TYPE BEARER FOR USER
      `>;

      expectTypeOf<Schema['accesses']['my_bearer']['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Schema['accesses']['my_bearer']['ifNotExists']>().toEqualTypeOf<false>();
    });

    it('parses bearer access with IF NOT EXISTS', () => {
      type Schema = ParseSchema<`
        DEFINE ACCESS IF NOT EXISTS my_bearer ON DATABASE TYPE BEARER FOR USER
      `>;

      expectTypeOf<Schema['accesses']['my_bearer']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<Schema['accesses']['my_bearer']['ifNotExists']>().toEqualTypeOf<true>();
    });
  });
});

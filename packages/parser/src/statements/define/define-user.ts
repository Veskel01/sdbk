import type { UserDurationSchema } from '../../schema';
import type {
  AfterFirstWord,
  ExtractComment,
  ExtractDuration,
  FirstWord,
  HasIfNotExists,
  HasOverwrite,
  SkipIfNotExists,
  SkipOverwrite,
  Trim,
  Upper
} from '../../utils';

/**
 * Result type for parsed DEFINE USER statements.
 *
 * @template Name - The username
 * @template Level - root, namespace, or database
 * @template Roles - Array of role names
 * @template HasPassword - Whether PASSWORD clause is present
 * @template HasPasshash - Whether PASSHASH clause is present
 * @template Duration - Token and session duration configuration
 * @template Comment - Optional comment
 * @template Overwrite - Whether OVERWRITE modifier is present
 * @template IfNotExists - Whether IF NOT EXISTS modifier is present
 */
export interface UserResult<
  Name extends string = string,
  Level extends 'root' | 'namespace' | 'database' = 'root' | 'namespace' | 'database',
  Roles extends string[] = string[],
  HasPassword extends boolean = boolean,
  HasPasshash extends boolean = boolean,
  Duration extends UserDurationSchema | undefined = undefined,
  Comment extends string | undefined = undefined,
  Overwrite extends boolean = false,
  IfNotExists extends boolean = false
> {
  kind: 'user';
  name: Name;
  level: Level;
  roles: Roles;
  hasPassword: HasPassword;
  hasPasshash: HasPasshash;
  duration: Duration;
  comment: Comment;
  overwrite: Overwrite;
  ifNotExists: IfNotExists;
}

export type ParseDefineUser<S extends string> = _ParseUser<Trim<S>>;

type _ParseUser<S extends string> = S extends `${infer A} ${infer B} ${infer C}`
  ? Upper<A> extends 'DEFINE'
    ? Upper<B> extends 'USER'
      ? _ExtractModifiersAndName<Trim<C>>
      : never
    : never
  : never;

type _ExtractModifiersAndName<S extends string> = HasOverwrite<S> extends true
  ? _UserBody<SkipOverwrite<S>, true, false>
  : HasIfNotExists<S> extends true
    ? _UserBody<SkipIfNotExists<S>, false, true>
    : _UserBody<S, false, false>;

type _UserBody<
  S extends string,
  Overwrite extends boolean,
  IfNotExists extends boolean
> = FirstWord<S> extends infer UName extends string
  ? _ExtractUserLevel<AfterFirstWord<S>> extends {
      level: infer L extends 'root' | 'namespace' | 'database';
      rest: infer R extends string;
    }
    ? UserResult<
        UName,
        L,
        _ExtractRoles<R>,
        _HasPassword<R>,
        _HasPasshash<R>,
        _ExtractUserDuration<R>,
        ExtractComment<R>,
        Overwrite,
        IfNotExists
      >
    : UserResult<
        UName,
        'database',
        [],
        _HasPassword<S>,
        _HasPasshash<S>,
        _ExtractUserDuration<S>,
        ExtractComment<S>,
        Overwrite,
        IfNotExists
      >
  : never;

// Extract ON ROOT/NAMESPACE/DATABASE
type _ExtractUserLevel<S extends string> = Upper<FirstWord<S>> extends 'ON'
  ? Upper<FirstWord<AfterFirstWord<S>>> extends 'ROOT'
    ? { level: 'root'; rest: AfterFirstWord<AfterFirstWord<S>> }
    : Upper<FirstWord<AfterFirstWord<S>>> extends 'NAMESPACE'
      ? { level: 'namespace'; rest: AfterFirstWord<AfterFirstWord<S>> }
      : Upper<FirstWord<AfterFirstWord<S>>> extends 'NS'
        ? { level: 'namespace'; rest: AfterFirstWord<AfterFirstWord<S>> }
        : Upper<FirstWord<AfterFirstWord<S>>> extends 'DATABASE'
          ? { level: 'database'; rest: AfterFirstWord<AfterFirstWord<S>> }
          : Upper<FirstWord<AfterFirstWord<S>>> extends 'DB'
            ? { level: 'database'; rest: AfterFirstWord<AfterFirstWord<S>> }
            : { level: 'database'; rest: S }
  : { level: 'database'; rest: S };

// Extract ROLES
type _ExtractRoles<S extends string> = Upper<S> extends `${string}ROLES ${infer Rest}`
  ? _ParseRoleList<Rest>
  : Upper<S> extends `${string}ROLE ${infer Rest}`
    ? _ParseRoleList<Rest>
    : [];

type _ParseRoleList<S extends string> = _ParseRolesUntilKeyword<FirstWord<S>>;

type _ParseRolesUntilKeyword<S extends string> = S extends `${infer F},${infer Rest}`
  ? [Trim<F>, ..._ParseRolesUntilKeyword<Trim<Rest>>]
  : Upper<S> extends 'DURATION' | 'COMMENT' | 'PASSWORD' | 'PASSHASH'
    ? []
    : Trim<S> extends ''
      ? []
      : [Trim<S>];

// Check for PASSWORD
type _HasPassword<S extends string> = Upper<S> extends `${string}PASSWORD ${string}` ? true : false;

// Check for PASSHASH
type _HasPasshash<S extends string> = Upper<S> extends `${string}PASSHASH ${string}` ? true : false;

// Extract DURATION
type _ExtractUserDuration<S extends string> = Upper<S> extends `${string}DURATION ${string}`
  ? {
      token: _ExtractTokenDuration<S>;
      session: _ExtractSessionDuration<S>;
    }
  : undefined;

type _ExtractTokenDuration<S extends string> = S extends `${string}FOR TOKEN ${infer Rest}`
  ? ExtractDuration<Rest>
  : S extends `${string}for token ${infer Rest}`
    ? ExtractDuration<Rest>
    : undefined;

type _ExtractSessionDuration<S extends string> = S extends `${string}FOR SESSION ${infer Rest}`
  ? ExtractDuration<Rest>
  : S extends `${string}for session ${infer Rest}`
    ? ExtractDuration<Rest>
    : undefined;

declare module '../registry' {
  interface StatementParsers<S extends string> {
    USER: ParseDefineUser<S>;
  }
}

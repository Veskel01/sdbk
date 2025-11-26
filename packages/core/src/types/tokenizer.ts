/** Lowercase letters */
export type LowerLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

/** Uppercase letters */
export type UpperLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

/** All letters (upper and lower case) */
export type Letter = LowerLetter | UpperLetter;

/** Digit characters */
export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** Whitespace characters */
export type Whitespace = ' ' | '\n' | '\t' | '\r';

/** Alphanumeric characters */
export type Alphanumeric = Letter | Digit;

/** Identifier characters (letters, digits, underscore) */
export type IdentifierChar = Alphanumeric | '_';

declare const TOKEN_ERROR_BRAND: unique symbol;

/** Represents a tokenization error with the invalid character and message. */
export interface TokenError<Char extends string, Message extends string = string> {
  readonly [TOKEN_ERROR_BRAND]: true;
  readonly _char: Char;
  readonly _message: Message;
}

/** Check if a type is a TokenError */
export type IsTokenError<T> = T extends TokenError<string, string> ? true : false;

/** Extract error details from TokenError */
export type ExtractTokenError<T> = T extends TokenError<infer C, infer M>
  ? { char: C; message: M }
  : never;

/**
 * Tokenizer configuration interface.
 * @typeParam AllowedChars - Union of allowed characters
 * @typeParam ErrorTemplate - Error message template (use $char for character placeholder)
 */
export interface Tokenizer<
  AllowedChars extends string,
  ErrorTemplate extends string = `Invalid character '$char' in input`
> {
  readonly _allowed: AllowedChars;
  readonly _errorTemplate: ErrorTemplate;
}

/** Extract allowed characters from tokenizer */
export type TokenizerAllowed<T> = T extends Tokenizer<infer A, string> ? A : never;

/** Extract error template from tokenizer */
export type TokenizerErrorTemplate<T> = T extends Tokenizer<string, infer E> ? E : never;

/** Create a tokenizer with allowed characters and optional error template */
export type CreateTokenizer<
  AllowedChars extends string,
  ErrorTemplate extends `${string}$char${string}` = `Invalid character '$char' in input`
> = Tokenizer<AllowedChars, ErrorTemplate>;

/** Find first character not in allowed set */
type FindInvalidChar<S extends string, Allowed extends string> = S extends `${infer C}${infer R}`
  ? C extends Allowed
    ? FindInvalidChar<R, Allowed>
    : C
  : never;

/** Check if string contains only allowed characters */
type IsValid<S extends string, Allowed extends string> = FindInvalidChar<S, Allowed> extends never
  ? true
  : false;

/** Format error message by replacing $char with actual character */
type FormatError<
  Template extends string,
  Char extends string
> = Template extends `${infer Before}$char${infer After}` ? `${Before}${Char}${After}` : Template;

/** Parse string with tokenizer - returns string if valid, TokenError if invalid. */
export type TokenizerParse<T extends Tokenizer<string, string>, S extends string> = IsValid<
  S,
  TokenizerAllowed<T>
> extends true
  ? S
  : TokenError<
      FindInvalidChar<S, TokenizerAllowed<T>>,
      FormatError<TokenizerErrorTemplate<T>, FindInvalidChar<S, TokenizerAllowed<T>>>
    >;

/** Check if string is valid for tokenizer (returns true/false). */
export type TokenizerIsValid<T extends Tokenizer<string, string>, S extends string> = IsValid<
  S,
  TokenizerAllowed<T>
>;

/** Find invalid character in string (returns never if all valid). */
export type TokenizerFindInvalid<
  T extends Tokenizer<string, string>,
  S extends string
> = FindInvalidChar<S, TokenizerAllowed<T>>;

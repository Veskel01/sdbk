// declare const TOKEN_ERROR_BRAND: unique symbol;

// export interface TokenError<InvalidChar extends string, Message extends string = string> {
//   readonly [TOKEN_ERROR_BRAND]: true;
//   readonly _char: InvalidChar;
//   readonly _message: Message;
// }

// export type LetterChar =
//   | 'a'
//   | 'b'
//   | 'c'
//   | 'd'
//   | 'e'
//   | 'f'
//   | 'g'
//   | 'h'
//   | 'i'
//   | 'j'
//   | 'k'
//   | 'l'
//   | 'm'
//   | 'n'
//   | 'o'
//   | 'p'
//   | 'q'
//   | 'r'
//   | 's'
//   | 't'
//   | 'u'
//   | 'v'
//   | 'w'
//   | 'x'
//   | 'y'
//   | 'z'
//   | 'A'
//   | 'B'
//   | 'C'
//   | 'D'
//   | 'E'
//   | 'F'
//   | 'G'
//   | 'H'
//   | 'I'
//   | 'J'
//   | 'K'
//   | 'L'
//   | 'M'
//   | 'N'
//   | 'O'
//   | 'P'
//   | 'Q'
//   | 'R'
//   | 'S'
//   | 'T'
//   | 'U'
//   | 'V'
//   | 'W'
//   | 'X'
//   | 'Y'
//   | 'Z';

// export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

// export type WhitespaceChar = ' ' | '\n' | '\t' | '\r';

// export type AlphanumericChar = LetterChar | DigitChar;

// export type IdentifierChar = AlphanumericChar | '_';

// type _FindInvalidChar<S extends string, Allowed extends string> = S extends `${infer C}${infer R}`
//   ? C extends Allowed
//     ? _FindInvalidChar<R, Allowed>
//     : C
//   : never;

// type _IsValid<S extends string, Allowed extends string> = _FindInvalidChar<S, Allowed> extends never
//   ? true
//   : false;

// export interface Tokenizer<
//   AllowedChars extends string,
//   ErrorTemplate extends string = `Invalid token '$char' in input`
// > {
//   readonly _allowed: AllowedChars;
//   readonly _errorTemplate: ErrorTemplate;
// }

// export type TokenizerAllowed<T> = T extends Tokenizer<infer A, string> ? A : never;

// export type TokenizerErrorTemplate<T> = T extends Tokenizer<string, infer E> ? E : never;

// type _FormatError<
//   Template extends string,
//   Char extends string
// > = Template extends `${infer Before}$char${infer After}` ? `${Before}${Char}${After}` : Template;

// export type TokenizerParse<T extends Tokenizer<string, string>, S extends string> = _IsValid<
//   S,
//   TokenizerAllowed<T>
// > extends true
//   ? S
//   : TokenError<
//       _FindInvalidChar<S, TokenizerAllowed<T>>,
//       _FormatError<TokenizerErrorTemplate<T>, _FindInvalidChar<S, TokenizerAllowed<T>>>
//     >;

// export type TokenizerIsValid<T extends Tokenizer<string, string>, S extends string> = _IsValid<
//   S,
//   TokenizerAllowed<T>
// >;

// export type TokenizerFindInvalid<
//   T extends Tokenizer<string, string>,
//   S extends string
// > = _FindInvalidChar<S, TokenizerAllowed<T>>;

// export type IsTokenError<T> = T extends TokenError<string, string> ? true : false;

// export type ExtractTokenError<T> = T extends TokenError<infer C, infer M>
//   ? { char: C; message: M }
//   : never;

// export type CreateTokenizer<
//   AllowedChars extends string,
//   ErrorTemplate extends string = `Invalid token '$char' in input`
// > = Tokenizer<AllowedChars, ErrorTemplate>;

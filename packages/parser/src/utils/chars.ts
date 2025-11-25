/**
 * Letter characters (ASCII a-z, A-Z)
 */
export type LetterChar =
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
  | 'z'
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

/**
 * Digit characters (0-9)
 */
export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/**
 * Whitespace characters
 */
export type WhitespaceChar = ' ' | '\n' | '\t' | '\r';

/**
 * Characters that can start an identifier
 */
export type IdentifierStartChar = LetterChar | '_';

/**
 * Characters that can continue an identifier
 */
export type IdentifierChar = LetterChar | DigitChar | '_';

/**
 * Alphanumeric characters
 */
export type AlphanumericChar = LetterChar | DigitChar;

/**
 * String delimiters
 */
export type StringDelimiter = "'" | '"';

/**
 * String prefixes in SurrealQL (r=raw, u=uuid, d=datetime, b=bytes, f=file)
 */
export type StringPrefix = '' | 'r' | 'u' | 'd' | 'b' | 'f';

/**
 * Punctuation characters
 */
export type PunctuationChar =
  | ','
  | ';'
  | ':'
  | '.'
  | '('
  | ')'
  | '['
  | ']'
  | '{'
  | '}'
  | '<'
  | '>'
  | '|'
  | '@'
  | '$'
  | '*'
  | '?'
  | '!'
  | '='
  | '+'
  | '-'
  | '/'
  | '%'
  | '&'
  | '~'
  | '^';

/**
 * All allowed characters in SurrealQL (for basic tokenization)
 */
export type AllowedChar =
  | LetterChar
  | DigitChar
  | WhitespaceChar
  | PunctuationChar
  | StringDelimiter;

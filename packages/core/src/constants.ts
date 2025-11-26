/** Regex for valid SurrealQL identifiers */
export const IDENTIFIER_REGEX = /^[a-zA-Z0-9_]*$/;

/** Regex for valid SurrealQL names */
export const NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Brand constants used for nominal typing of value objects.
 */
export const BRAND = {
  RECORD_ID: 'RecordId',
  UUID: 'Uuid',
  ULID: 'Ulid',
  BYTES: 'Bytes',
  DATETIME: 'Datetime',
  DURATION: 'Duration',
  RANGE: 'Range'
} as const;

/**
 * Symbol keys used globally.
 */
export const SYMBOL = {
  KIND: 'surrealdb:kind',
  ID_GENERATOR: 'sdbk:id-generator'
} as const;

/**
 * Token constants used in query generation.
 */
export const TOKEN = {
  BINDING: 'bind__',
  PARAM: '$'
} as const;

/**
 * Character constants.
 */
export const CHAR = {
  SEPARATOR: ':',
  L_BRACKET: '⟨',
  R_BRACKET: '⟩'
} as const;

import type { Upper } from '../utils';

/**
 * Check if field has READONLY modifier.
 */
export type HasReadonly<S extends string> = Upper<S> extends `${string}READONLY${string}`
  ? true
  : false;

/**
 * Check if field has FLEXIBLE modifier.
 */
export type HasFlexible<S extends string> = Upper<S> extends `${string}FLEXIBLE${string}`
  ? true
  : false;

/**
 * Check if index has UNIQUE modifier.
 */
export type HasUnique<S extends string> = Upper<S> extends `${string}UNIQUE${string}`
  ? true
  : false;

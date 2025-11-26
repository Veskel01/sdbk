/**
 * Empty object type.
 */
export type EmptyObject = Record<string, never>;

/**
 * Brands a type with a brand identifier.
 * @example
 * type BrandedString = Brand<string, 'String'>; // string & { readonly __brand: 'String' }
 */
export interface Brand<B extends string> {
  readonly __brand: B;
}

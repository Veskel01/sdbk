// import { ComputedFieldBuilder } from './computed-field-builder';
// import { RegularFieldBuilder } from './regular-field-builder';

// export function computed<TExpr extends string>(
//   expression: TExpr
// ): ComputedFieldBuilder<'any', unknown> {
//   return new ComputedFieldBuilder(expression);
// }

// TODO - create better API for field builders

// export const field = {
//   any: () => new RegularFieldBuilder('any' as const),
//   string: () => new RegularFieldBuilder('string' as const),
//   bool: () => new RegularFieldBuilder('bool' as const),
//   number: () => new RegularFieldBuilder('number' as const),
//   int: () => new RegularFieldBuilder('int' as const),
//   float: () => new RegularFieldBuilder('float' as const),
//   decimal: () => new RegularFieldBuilder('decimal' as const),
//   datetime: () => new RegularFieldBuilder('datetime' as const),
//   duration: () => new RegularFieldBuilder('duration' as const),
//   uuid: () => new RegularFieldBuilder('uuid' as const),
//   bytes: () => new RegularFieldBuilder('bytes' as const),
//   object: () => new RegularFieldBuilder('object' as const),
//   regex: () => new RegularFieldBuilder('regex' as const),
//   range: () => new RegularFieldBuilder('range' as const),

//   array: <T extends string>(itemType: T) => new RegularFieldBuilder(`array<${itemType}>` as const),

//   arrayMax: <T extends string, N extends number>(itemType: T, maxLength: N) =>
//     new RegularFieldBuilder(`array<${itemType}, ${maxLength}>` as const),

//   set: <T extends string>(itemType: T) => new RegularFieldBuilder(`set<${itemType}>` as const),

//   setMax: <T extends string, N extends number>(itemType: T, maxSize: N) =>
//     new RegularFieldBuilder(`set<${itemType}, ${maxSize}>` as const),

//   record: <T extends string>(tables: T) => new RegularFieldBuilder(`record<${tables}>` as const),

//   recordAny: () => new RegularFieldBuilder('record' as const),

//   geometry: <T extends FieldGeometrySubtype>(subtype: T) =>
//     new RegularFieldBuilder(`geometry<${subtype}>` as const),

//   geometryAny: () => new RegularFieldBuilder('geometry' as const),

//   literal: <T extends string>(value: T) => new RegularFieldBuilder(`literal<${value}>` as const),

//   type: <T extends string>(typeString: T) => new RegularFieldBuilder(typeString)
// } as const;

// export type FieldFactory = typeof field;
// export type ComputedFactory = typeof computed;

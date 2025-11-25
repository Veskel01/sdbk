// import type {
//   CreateTokenizer,
//   DigitChar,
//   IsTokenError,
//   LetterChar,
//   TokenError,
//   TokenizerParse,
//   WhitespaceChar
// } from './tokenizer';
// import type { Simplify, Trim } from './utility';

// export type FieldPrimitive =
//   | 'any'
//   | 'string'
//   | 'bool'
//   | 'number'
//   | 'int'
//   | 'float'
//   | 'decimal'
//   | 'datetime'
//   | 'duration'
//   | 'uuid'
//   | 'bytes'
//   | 'object'
//   | 'regex';

// export type FieldGeometrySubtype =
//   | 'feature'
//   | 'point'
//   | 'line'
//   | 'polygon'
//   | 'multipoint'
//   | 'multiline'
//   | 'multipolygon'
//   | 'collection';

// type GeoCoord2D = [number, number];
// type GeoCoord3D = [number, number, number];
// type GeoCoord = GeoCoord2D | GeoCoord3D;

// export interface GeoJSONPoint {
//   type: 'Point';
//   coordinates: GeoCoord;
// }

// export interface GeoJSONLineString {
//   type: 'LineString';
//   coordinates: GeoCoord[];
// }

// export interface GeoJSONPolygon {
//   type: 'Polygon';
//   coordinates: GeoCoord[][];
// }

// export interface GeoJSONMultiPoint {
//   type: 'MultiPoint';
//   coordinates: GeoCoord[];
// }

// export interface GeoJSONMultiLineString {
//   type: 'MultiLineString';
//   coordinates: GeoCoord[][];
// }

// export interface GeoJSONMultiPolygon {
//   type: 'MultiPolygon';
//   coordinates: GeoCoord[][][];
// }

// export interface GeoJSONGeometryCollection {
//   type: 'GeometryCollection';
//   geometries: GeoJSONGeometry[];
// }

// export interface GeoJSONFeature<G extends GeoJSONGeometry = GeoJSONGeometry> {
//   type: 'Feature';
//   geometry: G;
//   properties: Record<string, unknown>;
// }

// export type GeoJSONGeometry =
//   | GeoJSONPoint
//   | GeoJSONLineString
//   | GeoJSONPolygon
//   | GeoJSONMultiPoint
//   | GeoJSONMultiLineString
//   | GeoJSONMultiPolygon
//   | GeoJSONGeometryCollection;

// export interface FieldRange<T = unknown> {
//   begin: T;
//   end: T;
// }

// interface PrimitiveMap {
//   any: unknown;
//   string: string;
//   bool: boolean;
//   number: number;
//   int: number;
//   float: number;
//   decimal: number;
//   datetime: Date;
//   duration: string;
//   uuid: string;
//   bytes: Uint8Array;
//   object: Record<string, unknown>;
//   regex: RegExp;
// }

// interface GeometryMap {
//   feature: GeoJSONFeature;
//   point: GeoJSONPoint;
//   line: GeoJSONLineString;
//   polygon: GeoJSONPolygon;
//   multipoint: GeoJSONMultiPoint;
//   multiline: GeoJSONMultiLineString;
//   multipolygon: GeoJSONMultiPolygon;
//   collection: GeoJSONGeometryCollection;
// }

// type _Inc<T extends unknown[]> = [...T, 0];
// type _Dec<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];

// type _Depth = [unknown[], unknown[], unknown[]];
// type _D0 = [[], [], []];

// type _AtRoot<D extends _Depth> = D[0]['length'] extends 0
//   ? D[1]['length'] extends 0
//     ? D[2]['length'] extends 0
//       ? true
//       : false
//     : false
//   : false;

// type _UpdateDepth<C extends string, D extends _Depth> = C extends '<'
//   ? [_Inc<D[0]>, D[1], D[2]]
//   : C extends '>'
//     ? [_Dec<D[0]>, D[1], D[2]]
//     : C extends '{'
//       ? [D[0], _Inc<D[1]>, D[2]]
//       : C extends '}'
//         ? [D[0], _Dec<D[1]>, D[2]]
//         : C extends '['
//           ? [D[0], D[1], _Inc<D[2]>]
//           : C extends ']'
//             ? [D[0], D[1], _Dec<D[2]>]
//             : D;

// type _SplitAtRoot<
//   S extends string,
//   Delim extends string,
//   D extends _Depth = _D0,
//   Cur extends string = '',
//   Acc extends string[] = []
// > = S extends `${infer C}${infer R}`
//   ? C extends Delim
//     ? _AtRoot<D> extends true
//       ? _SplitAtRoot<Trim<R>, Delim, _D0, '', [...Acc, Trim<Cur>]>
//       : _SplitAtRoot<R, Delim, _UpdateDepth<C, D>, `${Cur}${C}`, Acc>
//     : _SplitAtRoot<R, Delim, _UpdateDepth<C, D>, `${Cur}${C}`, Acc>
//   : Cur extends ''
//     ? Acc
//     : [...Acc, Trim<Cur>];

// type _ParseArrayParams<
//   S extends string,
//   D extends _Depth = _D0,
//   Before extends string = '',
//   After extends string = ''
// > = S extends `${infer C}${infer R}`
//   ? C extends ','
//     ? _AtRoot<D> extends true
//       ? _ParseArrayParams<Trim<R>, _D0, `${Before}${After}`, ''>
//       : _ParseArrayParams<R, _UpdateDepth<C, D>, Before, `${After}${C}`>
//     : _ParseArrayParams<R, _UpdateDepth<C, D>, Before, `${After}${C}`>
//   : After extends ''
//     ? { content: `${Before}${After}`; max: undefined }
//     : Trim<After> extends `${infer N extends number}`
//       ? { content: Trim<Before>; max: N }
//       : { content: `${Before}${After}`; max: undefined };

// type FieldTypeTokenizer = CreateTokenizer<
//   | LetterChar
//   | DigitChar
//   | WhitespaceChar
//   | '<'
//   | '>'
//   | '{'
//   | '}'
//   | '['
//   | ']'
//   | '('
//   | ')'
//   | '|'
//   | ','
//   | ':'
//   | '"'
//   | "'"
//   | '.'
//   | '-'
//   | '_',
//   `Invalid token '$char' in field type definition`
// >;

// type _Validate<S extends string> = TokenizerParse<FieldTypeTokenizer, Trim<S>>;

// type _Literal<S extends string> = Trim<S> extends `"${infer V}"`
//   ? V
//   : Trim<S> extends `'${infer V}'`
//     ? V
//     : Trim<S> extends `${infer N extends number}`
//       ? N
//       : Trim<S>;

// type _Object<Fields extends string[]> = Simplify<{
//   [F in Fields[number] as F extends `${infer K}:${string}`
//     ? Trim<K>
//     : never]: F extends `${string}:${infer V}` ? _ParseSingle<Trim<V>> : never;
// }>;

// type _Tuple<Items extends string[]> = Items extends [
//   infer F extends string,
//   ...infer R extends string[]
// ]
//   ? _ParseSingle<F> extends infer T
//     ? IsTokenError<T> extends true
//       ? T
//       : [T, ..._Tuple<R>]
//     : never
//   : [];

// type _Union<Items extends string[]> = Items extends [
//   infer F extends string,
//   ...infer R extends string[]
// ]
//   ? _ParseSingle<F> extends infer T
//     ? IsTokenError<T> extends true
//       ? T
//       : T | _Union<R>
//     : never
//   : never;

// type _ArrayItem<S extends string> = Trim<S> extends `${string}|${string}`
//   ? _Union<_SplitAtRoot<Trim<S>, '|'>>
//   : _ParseSingle<Trim<S>>;

// type _ParseSingle<S extends string> = _Validate<S> extends infer V
//   ? IsTokenError<V> extends true
//     ? V
//     : Trim<S> extends `"${infer Val}"`
//       ? Val
//       : Trim<S> extends `'${infer Val}'`
//         ? Val
//         : Trim<S> extends `${infer N extends number}`
//           ? N
//           : Trim<S> extends `[${infer C}]`
//             ? _Tuple<_SplitAtRoot<Trim<C>, ','>>
//             : Trim<S> extends `{${infer C}}`
//               ? _Object<_SplitAtRoot<Trim<C>, ','>>
//               : Trim<S> extends `option<${infer I}>`
//                 ? _ParseSingle<I> extends infer T
//                   ? IsTokenError<T> extends true
//                     ? T
//                     : T | null
//                   : never
//                 : Trim<S> extends `array<${infer R}>`
//                   ? _ParseArrayParams<R>['content'] extends infer I extends string
//                     ? _ArrayItem<I> extends infer T
//                       ? IsTokenError<T> extends true
//                         ? T
//                         : T[]
//                       : never
//                     : unknown[]
//                   : Trim<S> extends 'array'
//                     ? unknown[]
//                     : Trim<S> extends `set<${infer R}>`
//                       ? _ParseArrayParams<R>['content'] extends infer I extends string
//                         ? _ParseSingle<I> extends infer T
//                           ? IsTokenError<T> extends true
//                             ? T
//                             : Set<T>
//                           : never
//                         : Set<unknown>
//                       : Trim<S> extends 'set'
//                         ? Set<unknown>
//                         : Trim<S> extends `record<${infer T}>`
//                           ? `${T}:${string}`
//                           : Trim<S> extends 'record'
//                             ? string
//                             : Trim<S> extends `geometry<${infer G}>`
//                               ? G extends keyof GeometryMap
//                                 ? GeometryMap[G]
//                                 : GeoJSONGeometry | GeoJSONFeature
//                               : Trim<S> extends 'geometry'
//                                 ? GeoJSONGeometry | GeoJSONFeature
//                                 : Trim<S> extends `literal<${infer C}>`
//                                   ? _Literal<C>
//                                   : Trim<S> extends 'literal'
//                                     ? string | number | boolean
//                                     : Trim<S> extends 'range'
//                                       ? FieldRange
//                                       : Trim<S> extends keyof PrimitiveMap
//                                         ? PrimitiveMap[Trim<S>]
//                                         : Trim<S> extends ''
//                                           ? TokenError<'', 'Empty type definition'>
//                                           : Trim<S>
//   : never;

// export type ParseFieldType<T extends string> = _Validate<T> extends infer V
//   ? IsTokenError<V> extends true
//     ? V
//     : _SplitAtRoot<Trim<T>, '|'> extends infer P
//       ? P extends string[]
//         ? P['length'] extends 0 | 1
//           ? _ParseSingle<Trim<T>>
//           : _Union<P>
//         : never
//       : never
//   : never;

// export type FieldCollectionItem =
//   | 'string'
//   | 'int'
//   | 'float'
//   | 'decimal'
//   | 'bool'
//   | 'number'
//   | 'datetime'
//   | 'duration'
//   | 'uuid'
//   | 'bytes'
//   | 'object'
//   | 'record';

// export type FieldArrayType =
//   | 'array'
//   | `array<${FieldCollectionItem}>`
//   | `array<${FieldCollectionItem},${number}>`
//   | `array<record<${string}>>`
//   | `array<record<${string}>,${number}>`
//   | `array<geometry<${FieldGeometrySubtype}>>`
//   | `array<geometry<${FieldGeometrySubtype}>,${number}>`
//   | `array<${string}>`;

// export type FieldSetType =
//   | 'set'
//   | `set<${FieldCollectionItem}>`
//   | `set<${FieldCollectionItem},${number}>`
//   | `set<record<${string}>>`
//   | `set<record<${string}>,${number}>`
//   | `set<${string}>`;

// export type FieldGeometryType = 'geometry' | `geometry<${FieldGeometrySubtype}>`;
// export type FieldRecordType = 'record' | `record<${string}>`;
// export type FieldRangeType = 'range';
// export type FieldLiteralType = 'literal' | `literal<${string}>`;
// export type FieldObjectType = `{${string}}`;
// export type FieldTupleType = `[${string}]`;
// export type FieldUnionType = `${string}|${string}`;

// export type FieldNullable =
//   | FieldPrimitive
//   | FieldArrayType
//   | FieldSetType
//   | FieldGeometryType
//   | FieldRecordType
//   | FieldRangeType
//   | FieldLiteralType
//   | FieldObjectType
//   | FieldTupleType;

// export type FieldOptionType = `option<${FieldNullable}>`;

// export type FieldType =
//   | FieldPrimitive
//   | FieldArrayType
//   | FieldSetType
//   | FieldGeometryType
//   | FieldRecordType
//   | FieldRangeType
//   | FieldLiteralType
//   | FieldOptionType
//   | FieldObjectType
//   | FieldTupleType
//   | FieldUnionType;

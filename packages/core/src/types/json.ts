export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type Json = JsonValue;

export type Jsonify<T> = T extends JsonPrimitive
  ? T
  : T extends JsonObject
    ? { [K in keyof T]: Jsonify<T[K]> }
    : T extends JsonArray
      ? Jsonify<T[number]>[]
      : T;

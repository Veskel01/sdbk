import type { ParseStatement } from '../parser';
import type { FunctionParam } from '../statements';
import type { FieldPermissionsSchema } from './table';

/**
 * Parse statements in chunks to avoid deep instantiation.
 * For 250+ statements, we process in chunks of 50.
 */
type ParseChunk<Stmts extends string[]> = {
  [K in keyof Stmts]: Stmts[K] extends string ? ParseStatement<Stmts[K]> : never;
};

/**
 * Parse all statements, chunking if necessary for large schemas.
 */
type ParseAll<Stmts extends string[]> = Stmts['length'] extends number
  ? `${Stmts['length']}` extends `${infer Len extends number}`
    ? Len extends
        | 0
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6
        | 7
        | 8
        | 9
        | 10
        | 11
        | 12
        | 13
        | 14
        | 15
        | 16
        | 17
        | 18
        | 19
        | 20
        | 21
        | 22
        | 23
        | 24
        | 25
        | 26
        | 27
        | 28
        | 29
        | 30
        | 31
        | 32
        | 33
        | 34
        | 35
        | 36
        | 37
        | 38
        | 39
        | 40
        | 41
        | 42
        | 43
        | 44
        | 45
        | 46
        | 47
        | 48
        | 49
        | 50
      ? ParseChunk<Stmts> // Small schema, parse directly
      : ParseInChunks<Stmts> // Large schema, use chunking
    : ParseChunk<Stmts>
  : ParseChunk<Stmts>;

/**
 * Parse large array in chunks of 50.
 */
type ParseInChunks<Stmts extends string[], Acc extends unknown[] = []> = Stmts extends readonly [
  ...infer Chunk extends string[],
  ...infer Rest extends string[]
]
  ? Chunk['length'] extends 50
    ? ParseInChunks<Rest, [...Acc, ...ParseChunk<Chunk>]>
    : [...Acc, ...ParseChunk<Stmts>]
  : Acc;

// ============================================================================
// EXTRACT BY KIND - Direct mapping with first-match strategy
// ============================================================================

/**
 * Extract table name from a single parsed statement.
 */
type ExtractTableName<P> = P extends { kind: 'table'; name: infer N extends string } ? N : never;

/**
 * Get all table names from parsed array.
 */
type GetAllTableNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractTableName<Parsed[K]>;
}[number];

/**
 * Get table info for a specific table name (first occurrence).
 */
type GetTableInfo<Parsed extends unknown[], TableName extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'table'; name: TableName } ? Parsed[K] : never;
  }[number],
  { kind: 'table'; name: TableName }
> extends {
  kind: 'table';
  name: TableName;
  schemaMode: infer SM;
  tableType: infer TT;
  drop: infer D extends boolean;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
  asSelect: infer AS;
  changefeed: infer CF;
  permissions: infer P;
  comment: infer C;
  relationConfig: infer RC;
}
  ? {
      name: TableName;
      schemaMode: SM;
      tableType: TT;
      drop: D;
      overwrite: OW;
      ifNotExists: INE;
      asSelect: AS;
      changefeed: CF;
      permissions: P;
      comment: C;
      relationConfig: RC;
    }
  : never;

/**
 * Build tables record by iterating over table names.
 */
type BuildTablesFromParsed<Parsed extends unknown[]> = {
  [T in GetAllTableNames<Parsed>]: GetTableInfo<Parsed, T> extends infer Info extends {
    name: string;
    schemaMode: unknown;
  }
    ? Info & { fields: CollectFieldsForTable<Parsed, T> }
    : never;
};

/**
 * Collect all fields for a specific table using mapped type.
 *
 * Note: TypeScript may show [x: string] index signature in tooltips for tables with many fields (30+).
 * This is a TypeScript optimization and doesn't affect functionality - specific keys still work correctly.
 * Example: fields['email'] will correctly return the email field type.
 */
type CollectFieldsForTable<Parsed extends unknown[], TableName extends string> = {
  [K in keyof Parsed as Parsed[K] extends {
    kind: 'field';
    name: infer FName extends string;
    table: TableName;
  }
    ? FName
    : never]: Parsed[K] extends {
    kind: 'field';
    name: infer FName extends string;
    table: TableName;
    type: infer Ty;
    dataType: infer DT extends string | undefined;
    readonly: infer R extends boolean;
    flexible: infer F extends boolean;
    computed: infer Comp extends string | undefined;
    default: infer D extends string | undefined;
    defaultAlways: infer DA extends boolean;
    value: infer V extends string | undefined;
    assert: infer A extends string | undefined;
    reference: infer Ref;
    permissions: infer P extends FieldPermissionsSchema | undefined;
    comment: infer C extends string | undefined;
    overwrite: infer OW extends boolean;
    ifNotExists: infer INE extends boolean;
  }
    ? {
        name: FName;
        type: Ty;
        dataType: DT;
        optional: false;
        readonly: R;
        flexible: F;
        computed: Comp;
        default: D;
        defaultAlways: DA;
        value: V;
        assert: A;
        reference: Ref;
        permissions: P;
        comment: C;
        overwrite: OW;
        ifNotExists: INE;
      }
    : never;
};

/**
 * Extract index name.
 */
type ExtractIndexName<P> = P extends { kind: 'index'; name: infer N extends string } ? N : never;

/**
 * Get all index names.
 */
type GetAllIndexNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractIndexName<Parsed[K]>;
}[number];

/**
 * Get first index with given name.
 */
type GetFirstIndex<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'index'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'index'; name: Name }
> extends {
  kind: 'index';
  name: Name;
  table: infer T extends string;
  fields: infer F extends string[];
  unique: infer U extends boolean;
  indexType: infer IT;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
  analyzer: infer AN extends string | undefined;
  comment: infer C extends string | undefined;
  concurrently: infer CC extends boolean;
  hnswConfig: infer HC;
}
  ? {
      name: Name;
      table: T;
      fields: F;
      unique: U;
      indexType: IT;
      overwrite: OW;
      ifNotExists: INE;
      analyzer: AN;
      comment: C;
      concurrently: CC;
      hnswConfig: HC;
    }
  : never;

/**
 * Build indexes record directly.
 */
type BuildIndexesFromParsed<Parsed extends unknown[]> = {
  [I in GetAllIndexNames<Parsed>]: GetFirstIndex<Parsed, I>;
};

/**
 * Extract event name.
 */
type ExtractEventName<P> = P extends { kind: 'event'; name: infer N extends string } ? N : never;

/**
 * Get all event names.
 */
type GetAllEventNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractEventName<Parsed[K]>;
}[number];

/**
 * Get first event with given name.
 */
type GetFirstEvent<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'event'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'event'; name: Name }
> extends {
  kind: 'event';
  name: Name;
  table: infer T extends string;
  when: infer W extends string | undefined;
  then: infer Th extends string | undefined;
  comment: infer C extends string | undefined;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? { name: Name; table: T; when: W; then: Th; comment: C; overwrite: OW; ifNotExists: INE }
  : never;

/**
 * Build events record directly.
 */
type BuildEventsFromParsed<Parsed extends unknown[]> = {
  [E in GetAllEventNames<Parsed>]: GetFirstEvent<Parsed, E>;
};

/**
 * Extract analyzer name.
 */
type ExtractAnalyzerName<P> = P extends { kind: 'analyzer'; name: infer N extends string }
  ? N
  : never;

/**
 * Get all analyzer names.
 */
type GetAllAnalyzerNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractAnalyzerName<Parsed[K]>;
}[number];

/**
 * Get first analyzer with given name.
 */
type GetFirstAnalyzer<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'analyzer'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'analyzer'; name: Name }
>;

/**
 * Build analyzers record directly.
 */
type BuildAnalyzersFromParsed<Parsed extends unknown[]> = {
  [A in GetAllAnalyzerNames<Parsed>]: GetFirstAnalyzer<Parsed, A>;
};

/**
 * Extract function name.
 */
type ExtractFunctionName<P> = P extends { kind: 'function'; name: infer N extends string }
  ? N
  : never;

/**
 * Get all function names.
 */
type GetAllFunctionNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractFunctionName<Parsed[K]>;
}[number];

/**
 * Get first function with given name.
 */
type GetFirstFunction<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'function'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'function'; name: Name }
> extends {
  kind: 'function';
  name: Name;
  params: infer P extends FunctionParam[];
  body: infer B;
  comment: infer C extends string | undefined;
  permissions: infer Perm;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? {
      name: Name;
      params: P;
      body: B;
      comment: C;
      permissions: Perm;
      overwrite: OW;
      ifNotExists: INE;
    }
  : never;

/**
 * Build functions record directly.
 */
type BuildFunctionsFromParsed<Parsed extends unknown[]> = {
  [F in GetAllFunctionNames<Parsed>]: GetFirstFunction<Parsed, F>;
};

/**
 * Extract param name.
 */
type ExtractParamName<P> = P extends { kind: 'param'; name: infer N extends string } ? N : never;

/**
 * Get all param names.
 */
type GetAllParamNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractParamName<Parsed[K]>;
}[number];

/**
 * Get first param with given name.
 */
type GetFirstParam<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'param'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'param'; name: Name }
> extends {
  kind: 'param';
  name: Name;
  value: infer V;
  permissions: infer Perm;
  comment: infer C;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? { name: Name; value: V; permissions: Perm; comment: C; overwrite: OW; ifNotExists: INE }
  : never;

/**
 * Build params record directly.
 */
type BuildParamsFromParsed<Parsed extends unknown[]> = {
  [P in GetAllParamNames<Parsed>]: GetFirstParam<Parsed, P>;
};

/**
 * Extract access name.
 */
type ExtractAccessName<P> = P extends { kind: 'access'; name: infer N extends string } ? N : never;

/**
 * Get all access names.
 */
type GetAllAccessNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractAccessName<Parsed[K]>;
}[number];

/**
 * Get first access with given name.
 * Access results vary by type (bearer, jwt, record), so we extract the full object.
 */
type GetFirstAccess<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'access'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'access'; name: Name }
>;

/**
 * Build accesses record directly.
 */
type BuildAccessesFromParsed<Parsed extends unknown[]> = {
  [A in GetAllAccessNames<Parsed>]: GetFirstAccess<Parsed, A>;
};

/**
 * Extract user name.
 */
type ExtractUserName<P> = P extends { kind: 'user'; name: infer N extends string } ? N : never;

/**
 * Get all user names.
 */
type GetAllUserNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractUserName<Parsed[K]>;
}[number];

/**
 * Get first user with given name.
 */
type GetFirstUser<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'user'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'user'; name: Name }
> extends {
  kind: 'user';
  name: Name;
  level: infer L extends 'root' | 'namespace' | 'database';
  roles: infer R extends string[];
  hasPassword: infer HP extends boolean;
  hasPasshash: infer HPH extends boolean;
  duration: infer D;
  comment: infer C;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? {
      name: Name;
      level: L;
      roles: R;
      hasPassword: HP;
      hasPasshash: HPH;
      duration: D;
      comment: C;
      overwrite: OW;
      ifNotExists: INE;
    }
  : never;

/**
 * Build users record directly.
 */
type BuildUsersFromParsed<Parsed extends unknown[]> = {
  [U in GetAllUserNames<Parsed>]: GetFirstUser<Parsed, U>;
};

/**
 * Extract bucket name.
 */
type ExtractBucketName<P> = P extends { kind: 'bucket'; name: infer N extends string } ? N : never;

/**
 * Get all bucket names.
 */
type GetAllBucketNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractBucketName<Parsed[K]>;
}[number];

/**
 * Get first bucket with given name.
 */
type GetFirstBucket<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'bucket'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'bucket'; name: Name }
> extends {
  kind: 'bucket';
  name: Name;
  backend: infer Backend;
  permissions: infer Permissions;
  comment: infer Comment;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? {
      name: Name;
      backend: Backend;
      permissions: Permissions;
      comment: Comment;
      overwrite: OW;
      ifNotExists: INE;
    }
  : never;

/**
 * Build buckets record directly.
 */
type BuildBucketsFromParsed<Parsed extends unknown[]> = {
  [B in GetAllBucketNames<Parsed>]: GetFirstBucket<Parsed, B>;
};

/**
 * Extract config type.
 */
type ExtractConfigType<P> = P extends { kind: 'config'; configType: infer T extends string }
  ? T
  : never;

/**
 * Get all config types.
 */
type GetAllConfigTypes<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractConfigType<Parsed[K]>;
}[number];

/**
 * Get first config with given type.
 */
type GetFirstConfig<Parsed extends unknown[], Type extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'config'; configType: Type } ? Parsed[K] : never;
  }[number],
  { kind: 'config'; configType: Type }
>;

/**
 * Build configs record directly.
 */
type BuildConfigsFromParsed<Parsed extends unknown[]> = {
  [C in GetAllConfigTypes<Parsed>]: GetFirstConfig<Parsed, C>;
};

/**
 * Extract module name.
 */
type ExtractModuleName<P> = P extends { kind: 'module'; name: infer N extends string } ? N : never;

/**
 * Get all module names.
 */
type GetAllModuleNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractModuleName<Parsed[K]>;
}[number];

/**
 * Get first module with given name.
 */
type GetFirstModule<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'module'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'module'; name: Name }
> extends {
  kind: 'module';
  name: Name;
  fileName: infer FN extends string | undefined;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? { name: Name; fileName: FN; overwrite: OW; ifNotExists: INE }
  : never;

/**
 * Build modules record directly.
 */
type BuildModulesFromParsed<Parsed extends unknown[]> = {
  [M in GetAllModuleNames<Parsed>]: GetFirstModule<Parsed, M>;
};

/**
 * Extract sequence name.
 */
type ExtractSequenceName<P> = P extends { kind: 'sequence'; name: infer N extends string }
  ? N
  : never;

/**
 * Get all sequence names.
 */
type GetAllSequenceNames<Parsed extends unknown[]> = {
  [K in keyof Parsed]: ExtractSequenceName<Parsed[K]>;
}[number];

/**
 * Get first sequence with given name.
 */
type GetFirstSequence<Parsed extends unknown[], Name extends string> = Extract<
  {
    [K in keyof Parsed]: Parsed[K] extends { kind: 'sequence'; name: Name } ? Parsed[K] : never;
  }[number],
  { kind: 'sequence'; name: Name }
> extends {
  kind: 'sequence';
  name: Name;
  batch: infer B extends number | undefined;
  start: infer ST extends number | undefined;
  timeout: infer T extends string | undefined;
  overwrite: infer OW extends boolean;
  ifNotExists: infer INE extends boolean;
}
  ? { name: Name; batch: B; start: ST; timeout: T; overwrite: OW; ifNotExists: INE }
  : never;

/**
 * Build sequences record directly.
 */
type BuildSequencesFromParsed<Parsed extends unknown[]> = {
  [S in GetAllSequenceNames<Parsed>]: GetFirstSequence<Parsed, S>;
};

type BuildFromParsed<Parsed extends unknown[]> = {
  tables: BuildTablesFromParsed<Parsed>;
  indexes: BuildIndexesFromParsed<Parsed>;
  events: BuildEventsFromParsed<Parsed>;
  analyzers: BuildAnalyzersFromParsed<Parsed>;
  functions: BuildFunctionsFromParsed<Parsed>;
  params: BuildParamsFromParsed<Parsed>;
  accesses: BuildAccessesFromParsed<Parsed>;
  users: BuildUsersFromParsed<Parsed>;
  buckets: BuildBucketsFromParsed<Parsed>;
  configs: BuildConfigsFromParsed<Parsed>;
  modules: BuildModulesFromParsed<Parsed>;
  sequences: BuildSequencesFromParsed<Parsed>;
};

/**
 * Build schema from array of statement strings.
 * Note: DeepSimplify may cause index signature widening for large schemas.
 * Use with caution or disable for production schemas with 100+ fields per table.
 */
export type BuildSchema<Stmts extends string[]> = BuildFromParsed<ParseAll<Stmts>>;

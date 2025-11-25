# @sdbk/parser

[![npm version](https://img.shields.io/npm/v/@sdbk/parser.svg)](https://www.npmjs.com/package/@sdbk/parser)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **compile-time** SurrealQL parser that transforms your database schema
definitions into fully typed TypeScript types. Zero runtime overhead — all
parsing happens at the type level.

> ⚠️ **Work in Progress**: Currently, only `DEFINE` statement syntax is
> supported. Support for DML statements (`SELECT`, `INSERT`, `UPDATE`,
> `DELETE`, etc.) is planned for future releases.

## Table of Contents

- [@sdbk/parser](#sdbkparser)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Supported Statements](#supported-statements)
  - [Type Mapping](#type-mapping)
  - [API Reference](#api-reference)
    - [ParseSchema](#parseschema)
    - [ParseStatement](#parsestatement)
    - [ParseDataType](#parsedatatype)
    - [SplitStatements](#splitstatements)
  - [Schema Structure](#schema-structure)
    - [Table Schema](#table-schema)
    - [Field Schema](#field-schema)
    - [Index Schema](#index-schema)
  - [Advanced Examples](#advanced-examples)
    - [E-Commerce Schema](#e-commerce-schema)
    - [Authentication \& Access Control](#authentication--access-control)
    - [Relation Tables](#relation-tables)
  - [Error Handling](#error-handling)
  - [Requirements](#requirements)
    - [tsconfig.json Recommendations](#tsconfigjson-recommendations)
  - [Performance Considerations](#performance-considerations)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 🚀 **Zero Runtime Overhead** — All parsing occurs at compile time via
  TypeScript's type system
- 📝 **Full DEFINE Syntax Support** — Parses all 13 DEFINE statement types
- 🔄 **SurrealQL to TypeScript Type Mapping** — Automatic conversion of
  SurrealQL types to TypeScript equivalents
- 🛡️ **Type-Safe Schema** — Extract and use your database schema with full
  type safety
- 📦 **No Dependencies** — Lightweight, standalone package
- 💬 **Comment Support** — Handles both line (`--`) and block (`/* */`) comments
- 🔧 **Case Insensitive** — Works with uppercase, lowercase, or mixed-case SQL keywords

## Installation

```bash
# npm
npm install --save-dev @sdbk/parser

# bun
bun add --save-dev @sdbk/parser

# pnpm
pnpm add --save-dev @sdbk/parser

# yarn
yarn add --save-dev @sdbk/parser
```

## Quick Start

```typescript
import type { ParseSchema } from '@sdbk/parser';

// Define your SurrealQL schema as a string literal type
type Schema = ParseSchema<`
  DEFINE TABLE user SCHEMAFULL;
  DEFINE FIELD id ON user TYPE string READONLY;
  DEFINE FIELD email ON user TYPE string;
  DEFINE FIELD name ON user TYPE option<string>;
  DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
  DEFINE INDEX idx_email ON user FIELDS email UNIQUE;
`>;

// Access your typed schema
type UserTable = Schema['tables']['user'];
// {
//   name: 'user';
//   schemaMode: 'schemafull';
//   fields: {
//     id: { name: 'id'; type: string; readonly: true; ... };
//     email: { name: 'email'; type: string; ... };
//     name: { name: 'name'; type: string | null;
      ... };
//     created_at: { name: 'created_at'; type: Date;
//       default: 'time::now()'; ... };
//   };
//   ...
// }

type EmailField = Schema['tables']['user']['fields']['email']['type'];
// string

type EmailIndex = Schema['indexes']['idx_email'];
// { name: 'idx_email'; table: 'user'; fields: ['email']; unique: true; ... }
```

## Supported Statements

| Statement | Status | Description |
| :-------- | :----- | :---------- |
| `DEFINE TABLE` | ✅ | Tables with schema modes, types, permissions, changefeeds |
| `DEFINE FIELD` | ✅ | Fields with types, defaults, assertions, computed values |
| `DEFINE INDEX` | ✅ | Indexes including UNIQUE, SEARCH, FULLTEXT, HNSW vector |
| `DEFINE EVENT` | ✅ | Event triggers with WHEN/THEN clauses |
| `DEFINE FUNCTION` | ✅ | Custom functions with typed parameters |
| `DEFINE PARAM` | ✅ | Global parameters with values and permissions |
| `DEFINE ANALYZER` | ✅ | Full-text search analyzers with tokenizers and filters |
| `DEFINE ACCESS` | ✅ | Authentication (Bearer, JWT, Record types) |
| `DEFINE USER` | ✅ | User definitions with roles and durations |
| `DEFINE SEQUENCE` | ✅ | Auto-incrementing sequences |
| `DEFINE BUCKET` | ✅ | File storage buckets |
| `DEFINE CONFIG` | ✅ | GraphQL and API configurations |
| `DEFINE MODULE` | ✅ | WASM module imports |

## Type Mapping

SurrealQL types are automatically mapped to their TypeScript equivalents:

| SurrealQL Type | TypeScript Type |
| :------------- | :-------------- |
| `string` | `string` |
| `int` | `number` |
| `float` | `number` |
| `decimal` | `number` |
| `number` | `number` |
| `bool` | `boolean` |
| `datetime` | `Date` |
| `duration` | `Duration` (branded string) |
| `uuid` | `string` |
| `ulid` | `string` |
| `bytes` | `Uint8Array` |
| `object` | `Record<string, unknown>` |
| `any` | `unknown` |
| `array<T>` | `T[]` |
| `set<T>` | `Set<T>` |
| `option<T>` | `T \| null` |
| `record<table>` | `RecordId<'table'>` |
| `record<a\|b>` | `RecordId<'a'> \| RecordId<'b'>` |
| `geometry<point>` | `PointGeometry` |
| `geometry<polygon>` | `PolygonGeometry` |
| `geometry<...>` | `GeoJSON` |
| `range<T>` | `[number, number]` |

## API Reference

### ParseSchema

The primary type for parsing complete SurrealQL schema definitions.

```typescript
import type { ParseSchema } from '@sdbk/parser';

type MySchema = ParseSchema<`
  DEFINE TABLE user SCHEMAFULL;
  DEFINE FIELD name ON user TYPE string;
  DEFINE FUNCTION fn::greet($name: string) { RETURN "Hello, " + $name; };
`>;
```

**Output Structure:**

```typescript
{
  tables: { [tableName: string]: TableSchema };
  indexes: { [indexName: string]: IndexSchema };
  events: { [eventName: string]: EventSchema };
  analyzers: { [analyzerName: string]: AnalyzerSchema };
  functions: { [functionName: string]: FunctionSchema };
  params: { [paramName: string]: ParamSchema };
  accesses: { [accessName: string]: AccessSchema };
  users: { [userName: string]: UserSchema };
  sequences: { [sequenceName: string]: SequenceSchema };
  buckets: { [bucketName: string]: BucketSchema };
  configs: { [configType: string]: ConfigSchema };
  modules: { [moduleName: string]: ModuleSchema };
}
```

### ParseStatement

Parse a single SurrealQL statement.

```typescript
import type { ParseStatement } from '@sdbk/parser';

type TableResult = ParseStatement<'DEFINE TABLE user SCHEMAFULL'>;
// { kind: 'table'; name: 'user'; schemaMode: 'schemafull'; ... }

type FieldResult = ParseStatement<'DEFINE FIELD email ON user TYPE string'>;
// { kind: 'field'; name: 'email'; table: 'user'; type: string; ... }
```

### ParseDataType

Parse a SurrealQL type string into its TypeScript equivalent.

```typescript
import type { ParseDataType } from '@sdbk/parser';

type StringType = ParseDataType<'string'>;           // string
type ArrayType = ParseDataType<'array<int>'>;        // number[]
type OptionType = ParseDataType<'option<string>'>;   // string | null
type RecordType = ParseDataType<'record<user>'>;     // RecordId<'user'>
type UnionRecord = ParseDataType<'record<user|post>'>; // RecordId<'user'> | RecordId<'post'>
type NestedType = ParseDataType<'array<option<string>>'>; // (string | null)[]
```

### SplitStatements

Split a multi-statement SurrealQL string into individual statements.

```typescript
import type { SplitStatements } from '@sdbk/parser';

type Statements = SplitStatements<`
  DEFINE TABLE user;
  DEFINE FIELD name ON user TYPE string
`>;
// ['DEFINE TABLE user', 'DEFINE FIELD name ON user TYPE string']
```

## Schema Structure

### Table Schema

```typescript
import type { Schema } from '@sdbk/parser';

type UserTable = Schema['tables']['user'];
// TableSchema:
UserTable['schemaMode'];      // 'schemafull' | 'schemaless' | undefined
UserTable['tableType'];       // 'any' | 'normal' | 'relation' | undefined
UserTable['changefeed'];      // ChangefeedConfigSchema | undefined
UserTable['permissions'];     // TablePermissionsSchema | undefined
UserTable['relationConfig'];  // RelationConfigSchema | undefined
UserTable['fields'];          // Record<string, FieldSchema>
```

### Field Schema

```typescript
import type { Schema } from '@sdbk/parser';

type EmailField = Schema['tables']['user']['fields']['email'];
// FieldSchema:
EmailField['type'];         // mapped TypeScript type inferred from SurrealQL TYPE
EmailField['dataType'];     // original SurrealQL type string, e.g. 'option<string>'
EmailField['readonly'];     // boolean
EmailField['reference'];    // ReferenceConfigSchema | undefined
EmailField['permissions'];  // FieldPermissionsSchema | undefined
```

### Index Schema

```typescript
import type { Schema } from '@sdbk/parser';

type EmailIndex = Schema['indexes']['idx_email'];
// IndexSchema:
EmailIndex['indexType'];   // 'unique' | 'search' | 'fulltext' | 'hnsw' | 'count' | undefined
EmailIndex['hnswConfig'];  // HnswConfig | undefined
```

## Advanced Examples

### E-Commerce Schema

```typescript
import type { ParseSchema, RecordId } from '@sdbk/parser';

type ECommerceSchema = ParseSchema<`
  -- Products
  DEFINE TABLE product SCHEMAFULL;
  DEFINE FIELD id ON product TYPE string READONLY;
  DEFINE FIELD name ON product TYPE string;
  DEFINE FIELD price ON product TYPE decimal ASSERT $value > 0;
  DEFINE FIELD stock ON product TYPE int DEFAULT 0;
  DEFINE FIELD category ON product TYPE record<category> REFERENCE ON DELETE REJECT;
  DEFINE INDEX idx_product_name ON product FIELDS name SEARCH ANALYZER product_search;

  -- Categories
  DEFINE TABLE category SCHEMAFULL;
  DEFINE FIELD id ON category TYPE string READONLY;
  DEFINE FIELD name ON category TYPE string;
  DEFINE FIELD parent ON category TYPE option<record<category>>;
  DEFINE INDEX idx_category_name ON category FIELDS name UNIQUE;

  -- Orders with computed total
  DEFINE TABLE order SCHEMAFULL;
  DEFINE FIELD id ON order TYPE string READONLY;
  DEFINE FIELD user ON order TYPE record<user> REFERENCE ON DELETE CASCADE;
  DEFINE FIELD status ON order TYPE string DEFAULT "pending";
  DEFINE FIELD total ON order COMPUTED math::sum(items.*.price);
  DEFINE FIELD created_at ON order TYPE datetime DEFAULT time::now() READONLY;

  -- Custom functions
  DEFINE FUNCTION fn::calculate_discount(
    $order_id: record<order>,
    $percent: decimal
  ) {
    RETURN UPDATE order SET total = total * (1 - $percent / 100)
      WHERE id = $order_id;
  } COMMENT "Apply percentage discount"
    PERMISSIONS WHERE $auth.admin = true;

  -- Full-text search analyzer
  DEFINE ANALYZER product_search
    TOKENIZERS blank,class
    FILTERS lowercase,edgengram(2,10)
    COMMENT "Product name search";
`>;

// Type-safe access
type Product = ECommerceSchema['tables']['product'];
type ProductFields = Product['fields'];
type PriceType = ProductFields['price']['type'];        // number
type CategoryRef = ProductFields['category']['type'];   // RecordId<'category'>

type OrderTable = ECommerceSchema['tables']['order'];
type ComputedTotal = OrderTable['fields']['total']['computed']; // 'math::sum(items.*.price)'
```

### Authentication & Access Control

```typescript
import type { ParseSchema } from '@sdbk/parser';

type AuthSchema = ParseSchema<`
  -- JWT Authentication
  DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT
    ALGORITHM RS256
    KEY "-----BEGIN PUBLIC KEY-----..."
    DURATION FOR SESSION 24h;

  -- Record-based authentication with signup/signin
  DEFINE ACCESS account ON DATABASE TYPE RECORD
    SIGNUP (CREATE user SET email = $email,
      pass = crypto::argon2::generate($pass))
    SIGNIN (SELECT * FROM user WHERE email = $email
      AND crypto::argon2::compare(pass, $pass))
    WITH JWT ALGORITHM HS512 KEY "secret"
    WITH REFRESH
    AUTHENTICATE $session.user != NONE
    DURATION FOR TOKEN 15m FOR SESSION 7d;

  -- API Bearer tokens
  DEFINE ACCESS api_token ON DATABASE TYPE BEARER FOR USER
    DURATION FOR GRANT 30d FOR TOKEN 1h FOR SESSION 24h
    AUTHENTICATE $token != NONE;

  -- User roles
  DEFINE USER admin ON ROOT PASSWORD "secure" ROLES OWNER COMMENT "Administrator";
  DEFINE USER api_user ON DATABASE PASSWORD "api_key" ROLES EDITOR
    DURATION FOR TOKEN 1h FOR SESSION 24h;
`>;

type JwtAccess = AuthSchema['accesses']['jwt_auth'];
type RecordAccess = AuthSchema['accesses']['account'];
type AdminUser = AuthSchema['users']['admin'];
```

### Relation Tables

```typescript
import type { ParseSchema } from '@sdbk/parser';

type SocialSchema = ParseSchema<`
  DEFINE TABLE user SCHEMAFULL;
  DEFINE FIELD id ON user TYPE string READONLY;
  DEFINE FIELD username ON user TYPE string;

  -- Relation table for followers
  DEFINE TABLE follows TYPE RELATION FROM user TO user ENFORCED;
  DEFINE FIELD in ON follows TYPE record<user> READONLY;
  DEFINE FIELD out ON follows TYPE record<user> READONLY;
  DEFINE FIELD created_at ON follows TYPE datetime DEFAULT time::now();

  -- Relation table for likes
  DEFINE TABLE likes TYPE RELATION IN user OUT post;
  DEFINE FIELD in ON likes TYPE record<user> READONLY;
  DEFINE FIELD out ON likes TYPE record<post> READONLY;
`>;

type FollowsRelation = SocialSchema['tables']['follows'];
type RelationType = FollowsRelation['tableType'];
  // 'relation'
type RelationConfig = FollowsRelation['relationConfig'];
  // { from: 'user'; to: 'user'; enforced: true }
```

## Error Handling

The parser provides typed error messages for invalid syntax:

```typescript
import type { ParseStatement, ParseError, IsParseError } from '@sdbk/parser';

type Result = ParseStatement<'INVALID SYNTAX'>;
type CheckError = IsParseError<Result>; // true

// Error types available:
// - ParseErrors.InvalidSyntax
// - ParseErrors.UnknownStatement
// - ParseErrors.InvalidTableName
// - ParseErrors.InvalidFieldName
// - ParseErrors.TypeDepthExceeded
// - ParseErrors.UnclosedComment
// - ParseErrors.UnclosedString
// - ParseErrors.InvalidType
```

## Requirements

- **TypeScript**: >= 5.0.0
- **Strict Mode**: Recommended for best type inference

### tsconfig.json Recommendations

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Performance Considerations

- The parser operates entirely at compile time, so there's no runtime cost
- For very large schemas (250+ statements), the parser uses chunked
  processing to avoid TypeScript's recursion limits
- Type nesting is limited to 10 levels to prevent infinite recursion

## Contributing

Contributions are welcome! Please see the
[main repository](https://github.com/veskel01/sdbk) for contribution
guidelines.

## License

MIT © [Jakub Andrzejewski (Veskel01)](https://github.com/veskel01)

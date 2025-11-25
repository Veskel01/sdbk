# SurrealDBKit (sdbk)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

A modern TypeScript toolkit for SurrealDB providing type-safe APIs, query
builders, and development tools for building scalable applications with
SurrealDB.

## Overview

SurrealDBKit (sdbk) is a collection of TypeScript packages designed to make
working with SurrealDB safer, more productive, and enjoyable:

- **Type Safety** — Full TypeScript support with compile-time validation
- **Developer Experience** — Intuitive APIs and helpful tooling
- **Performance** — Zero runtime overhead for type operations
- **Modular** — Use only what you need

> ⚠️ **Early Development**: This project is in active development. APIs may
> change and some packages are still in progress.

## Packages

This monorepo contains the following packages:

### [`@sdbk/core`](./packages/core)

Foundational type definitions and utilities for SurrealDBKit. Provides core
types, building blocks, and shared abstractions used across rest of the packages.

**Status:** 🚧 In Development

**Key Features:**

- Entity and field type definitions
- Expression builders and identifiers
- Schema type system
- Runtime type guards
- Shared utilities for other packages

### [`@sdbk/parser`](./packages/parser)

A compile-time SurrealQL parser that transforms database schema definitions into
fully typed TypeScript types. Useful for type generation and schema validation.

**Status:** ✅ Available

[📖 Read the documentation](./packages/parser/README.md)

### Planned Packages

The following packages are planned and will build on top of `@sdbk/core`:

- **`@sdbk/client`** — Type-safe client wrapper for SurrealDB (uses core types)
- **`@sdbk/query`** — Query builder with type inference (uses core expressions)
- **`@sdbk/migrate`** — Schema migration tools (uses core schema types)

*All packages depend on `@sdbk/core` for shared type definitions and
utilities.*

## Installation

Install the packages you need. Most packages will automatically include
`@sdbk/core` as a dependency:

```bash
# Install parser for schema type generation
npm install @sdbk/parser

# Or install core directly for building on top of it
npm install @sdbk/core

# Using bun
bun add @sdbk/parser

# Using pnpm
pnpm add @sdbk/parser
```

> **Note:** `@sdbk/core` will be automatically installed as a peer dependency
> for packages that require it.

## Usage

Check out the individual package documentation for usage examples:

- [Parser Usage](./packages/parser/README.md) — Type generation from SurrealQL
  schemas
- [Core Usage](./packages/core/) — Core types and utilities

More examples and documentation will be added as packages are developed.

## Requirements

- **TypeScript**: >= 5.0.0
- **Node.js**: >= 18.0.0 (for development)
- **Bun**: >= 1.3.3 (recommended package manager)

## Development

This is a monorepo managed with [Turbo](https://turbo.build/) and uses
[Bun](https://bun.sh/) as the package manager.

### Prerequisites

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
```

### Setup

```bash
# Clone the repository
git clone https://github.com/veskel01/sdbk.git
cd sdbk

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Run linting
bun run lint

# Format code
bun run format
```

### Available Scripts

- `bun run build` — Build all packages
- `bun run test` — Run tests for all packages
- `bun run lint` — Lint all packages
- `bun run format` — Format all packages
- `bun run check:types` — Type-check all packages
- `bun run clean:workspace` — Clean build artifacts

### Project Structure

```text
sdbk/
├── packages/
│   ├── core/          # Core type definitions
│   └── parser/        # SurrealQL parser
├── scripts/           # Build and utility scripts
└── turbo.json         # Turbo configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:

- [Biome](https://biomejs.dev/) for formatting and linting
- [Commitlint](https://commitlint.js.org/) for commit message conventions
- [Husky](https://typicode.github.io/husky/) for git hooks

## License

MIT © [Jakub Andrzejewski (Veskel01)](https://github.com/veskel01)

See [LICENSE](./LICENSE) file for details.

## Links

- [Repository](https://github.com/veskel01/sdbk)
- [Issues](https://github.com/veskel01/sdbk/issues)
- [SurrealDB Documentation](https://surrealdb.com/docs)

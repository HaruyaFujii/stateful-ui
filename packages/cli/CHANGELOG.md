# @behave-ui/cli

## 1.0.3

### Patch Changes

- Update CLI templates with discriminated union support

  - Added discriminated union support to AutoForm templates
  - Synced CLI templates with latest React package components
  - Fixed Zod v4 compatibility issues in templates
  - Templates now support conditional field rendering based on discriminator values

## 1.0.2

### Patch Changes

- feat: Complete Zod v4 compatibility with zero-break migration

  **@behave-ui/react:**

  - 🎯 **True zero-break compatibility**: Supports both Zod v3 and v4 simultaneously
  - 🔧 **Email/URL field detection**: Updated schema-utils for v3 (`c.kind`) and v4 (`c.format`) compatibility
  - 📦 **Dependencies updated**: @hookform/resolvers v3.10.0 → v5.2.2 for full Zod v4 support
  - 📖 **Comprehensive README**: Component documentation, comparisons, and examples
  - ✅ **All tests passing**: 61 test cases verify complete compatibility

  **@behave-ui/cli:**

  - 📖 **Detailed README**: Usage examples and universal package manager support
  - 📁 **README included**: Added to package files for npm distribution

## 1.0.1

### Patch Changes

- docs: Add comprehensive README files to both packages

  - Add detailed README.md for @behave-ui/cli with usage examples and universal package manager support
  - Add detailed README.md for @behave-ui/react with component documentation and comparisons
  - Include README.md in package files for npm distribution
  - Update @behave-ui/react to use Zod v4.3.6 in dependencies

## 1.0.0

### Major Changes

- feat: Add yarn dlx support by embedding component templates

  - Embed component templates directly in CLI package instead of referencing @behave-ui/react
  - Fixes yarn dlx compatibility issues caused by package resolution differences
  - Removes @behave-ui/react dependency from CLI, making it fully self-contained
  - Now supports npx, yarn dlx, and pnpm dlx consistently

  Breaking change: CLI no longer requires @behave-ui/react as dependency

## 0.1.4

### Patch Changes

- Updated dependencies [f1c429c]
  - @behave-ui/react@0.2.0

## 0.1.3

### Patch Changes

- c61fb05: Fix: Update DataFetch file list in CLI registry

  Corrected the file list for DataFetch component to match actual implementation.
  Removed non-existent cache-client.ts and added necessary files.

- c61fb05: Fix: Zod v4 compatibility for AutoForm

  Updated schema-utils.ts to use `_def.typeName` instead of `instanceof` checks,
  ensuring full compatibility with Zod v4 as per the project requirements.
  This is a critical differentiator for behave-ui.

- Updated dependencies [c61fb05]
  - @behave-ui/react@0.1.2

## 0.1.2

### Patch Changes

- Fix: Add @behave-ui/react as dependency to ensure source files are available

  The CLI needs access to the react package files when running via npx.
  Adding it as a dependency ensures the files are available in the npx cache.

## 0.1.1

### Patch Changes

- e993a33: Initial release of behave-ui packages

  - @behave-ui/react: Behavior-first React components with AsyncButton, AutoForm, and DataFetch
  - @behave-ui/cli: CLI tool for adding behave-ui components to your project

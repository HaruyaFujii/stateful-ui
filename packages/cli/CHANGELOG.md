# @behave-ui/cli

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

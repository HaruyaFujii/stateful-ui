# @behave-ui/react

## 0.1.2

### Patch Changes

- c61fb05: Fix: Zod v4 compatibility for AutoForm

  Updated schema-utils.ts to use `_def.typeName` instead of `instanceof` checks,
  ensuring full compatibility with Zod v4 as per the project requirements.
  This is a critical differentiator for behave-ui.

## 0.1.1

### Patch Changes

- 0301c43: Fix: Include source files in npm package for CLI to work properly

  The CLI needs access to component source files to copy them to user projects.
  Added 'src' directory to the published npm package.

- e993a33: Initial release of behave-ui packages

  - @behave-ui/react: Behavior-first React components with AsyncButton, AutoForm, and DataFetch
  - @behave-ui/cli: CLI tool for adding behave-ui components to your project

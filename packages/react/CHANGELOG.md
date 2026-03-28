# @behave-ui/react

## 0.2.0

### Minor Changes

- f1c429c: feat: Complete Zod v4 compatibility for AutoForm

  - Add full Zod v4 API support for schema introspection
  - Fix number field value conversion with valueAsNumber
  - Fix enum option extraction for select dropdowns
  - Improve field styling with minWidth and minHeight
  - Export getZodTypeName for better extensibility

  This ensures AutoForm works seamlessly with both Zod v3 and v4, making it the only form library with complete Zod v4 support.

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

# @behave-ui/cli

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

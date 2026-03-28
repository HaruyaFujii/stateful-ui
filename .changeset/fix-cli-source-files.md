---
"@behave-ui/react": patch
---

Fix: Include source files in npm package for CLI to work properly

The CLI needs access to component source files to copy them to user projects.
Added 'src' directory to the published npm package.
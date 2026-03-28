---
"@behave-ui/react": patch
"@behave-ui/cli": patch
---

Fix: Zod v4 compatibility for AutoForm

Updated schema-utils.ts to use `_def.typeName` instead of `instanceof` checks,
ensuring full compatibility with Zod v4 as per the project requirements.
This is a critical differentiator for behave-ui.
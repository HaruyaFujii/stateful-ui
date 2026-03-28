---
"@behave-ui/react": minor
---

feat: Complete Zod v4 compatibility for AutoForm

- Add full Zod v4 API support for schema introspection
- Fix number field value conversion with valueAsNumber
- Fix enum option extraction for select dropdowns
- Improve field styling with minWidth and minHeight
- Export getZodTypeName for better extensibility

This ensures AutoForm works seamlessly with both Zod v3 and v4, making it the only form library with complete Zod v4 support.
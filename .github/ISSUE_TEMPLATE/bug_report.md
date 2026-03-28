---
name: Bug report
about: Create a report to help us improve
labels: ["bug"]
assignees: ''
---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1.
2.
3.
4.

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Environment Information

- **OS**: [e.g., macOS 14.0, Windows 11, Ubuntu 22.04]
- **Node.js version**: [e.g., 20.10.0]
- **Package manager**: [e.g., npm 10.2.3, yarn 4.1.0, pnpm 8.14.0]
- **@behave-ui/react version**: [e.g., 0.3.0]
- **React version**: [e.g., 18.2.0]

## Minimal Reproduction Code

```tsx
// Please provide a minimal code example that reproduces the issue
import { AutoForm } from '@behave-ui/react';
import { z } from 'zod';

const schema = z.object({
  // your schema here
});

function MyComponent() {
  return (
    <AutoForm
      schema={schema}
      onSubmit={async (values) => {
        // reproduction steps here
      }}
    />
  );
}
```

## Additional Context

Add any other context about the problem here (screenshots, error logs, etc.).
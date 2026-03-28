# @behave-ui/react

**Behavior-first React components. Async state, forms, and data fetching — batteries included.**

A collection of React components that handle complex UI behaviors out of the box. Focus on your business logic while we handle the tedious state management.

> "1つの『めんどくさい』を完璧に潰す"

## ✨ Features

- 🔄 **AsyncButton** — Automatic pending/success/error state management
- 📋 **AutoForm** — Complete Zod v4 schema-to-form generation with Discriminated Union support
- 📊 **DataFetch** — Declarative data fetching with built-in states
- 🪝 **useAsyncState** — Core async state hook for custom components
- 🛡️ **Type-safe** — Full TypeScript support with generic type inference
- 🎯 **Zero magic** — Transparent state via `data-status` attributes

## 🆚 Before vs After

```tsx
// ❌ Before: Manual boilerplate every time
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

async function handleClick() {
  setLoading(true);
  try {
    await api.submit(data);
  } catch (e) {
    setError(e as Error);
  } finally {
    setLoading(false);
  }
}
```

```tsx
// ✅ After: Behavior-first component
<AsyncButton onClick={() => api.submit(data)} loadingText="Submitting...">
  Submit
</AsyncButton>
```

## 📥 Installation

### Option A: CLI (Recommended)

Copy components with full source control:

```bash
# npm/pnpm users
npx @behave-ui/cli@latest add async-button auto-form data-fetch

# yarn users
yarn dlx @behave-ui/cli@latest add async-button auto-form data-fetch
```

### Option B: npm Package

```bash
npm install @behave-ui/react
# or
yarn add @behave-ui/react
```

## 🧩 Components

### AsyncButton

Handles async operations with automatic state transitions:

```tsx
import { AsyncButton } from '@behave-ui/react';

<AsyncButton
  onClick={async () => await api.submitForm(data)}
  loadingText="Submitting..."
  successText="Success!"
  errorText="Failed"
  onSuccess={(result) => router.push('/success')}
  onError={(error) => toast.error(error.message)}
>
  Submit Form
</AsyncButton>
```

**State Machine:**
```
idle ──(click)──► pending ──(resolve)──► success ──(2s)──► idle
                      └───(reject)───► error ──(click)──► idle
```

### AutoForm

Generate complete forms from Zod v4 schemas:

```tsx
import { z } from 'zod';
import { AutoForm } from '@behave-ui/react';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  age: z.number().int().positive().max(120),
  role: z.enum(['admin', 'user', 'viewer']),
  isActive: z.boolean().default(true),
});

<AutoForm
  schema={schema}
  onSubmit={async (data) => await api.createUser(data)}
  fieldConfig={{
    age: { label: 'Age', type: 'number' },
    role: { label: 'Role', type: 'select' },
    isActive: { label: 'Active', type: 'checkbox' },
  }}
/>
```

**Discriminated Union Support (v0.4.0+):**

```tsx
const schema = z.discriminatedUnion('accountType', [
  z.object({
    accountType: z.literal('personal'),
    name: z.string().min(1),
    age: z.number().int().positive(),
  }),
  z.object({
    accountType: z.literal('company'),
    companyName: z.string().min(1),
    taxId: z.string(),
    employees: z.number().int().positive(),
  }),
]);

<AutoForm schema={schema} onSubmit={handleSubmit} />
// Fields automatically switch based on accountType selection!
```

**Zod v4 Features:**
- ✅ Discriminated Unions for conditional fields
- ✅ Number fields with correct type conversion
- ✅ Enum dropdowns with proper option display
- ✅ Default values and optional fields
- ✅ Full schema validation
- ✅ Zero-break compatibility with Zod v3

### DataFetch

Declarative data fetching with automatic state management:

```tsx
import { DataFetch } from '@behave-ui/react';

<DataFetch
  queryKey={['user', userId]}
  queryFn={() => api.getUser(userId)}
  loadingFallback={<UserSkeleton />}
  errorFallback={({ error, retry }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
  emptyFallback={<p>No user found</p>}
>
  {(user) => <UserProfile user={user} />}
</DataFetch>
```

### useAsyncState

Core hook for custom async components:

```tsx
import { useAsyncState } from '@behave-ui/react';

const { execute, isPending, isSuccess, isError, error } = useAsyncState({
  onSuccess: () => toast.success('Done!'),
  onError: (err) => toast.error(err.message),
  resetDelay: 3000,
});

<button onClick={() => execute(() => uploadFile(file))} disabled={isPending}>
  {isPending ? 'Uploading...' : 'Upload File'}
</button>
```

## 🎯 Design Principles

1. **Behavior-first** — Components encapsulate state machines, not just UI
2. **Zero magic** — Internal state always visible via `data-status` attributes
3. **Type-safe** — Generics preserve type information through callbacks
4. **Non-destructive** — No global providers, add one component at a time
5. **Single responsibility** — One component solves one specific pain point

## 🔧 Requirements

- React 18+
- TypeScript 4.9+ (for best experience)
- Zod 4.0+ (for AutoForm)
- react-hook-form + @hookform/resolvers (for AutoForm)

## 📊 Bundle Size

| Component | Gzipped | Notes |
|-----------|---------|--------|
| AsyncButton | ~2KB | Includes useAsyncState |
| AutoForm | ~8KB | Includes form validation |
| DataFetch | ~3KB | Includes caching logic |
| Full package | ~12KB | Tree-shakeable |

## 🆚 Alternatives

| Library | behave-ui | React Query | Formik | Ant Design |
|---------|-----------|-------------|--------|------------|
| Bundle size | 12KB | 36KB | 15KB | 1.2MB |
| Behavior-first | ✅ | ❌ | ❌ | ❌ |
| Zero config | ✅ | ❌ | ❌ | ❌ |
| Type inference | ✅ | ✅ | ❌ | ❌ |
| Zod v4 support | ✅ | ❌ | ❌ | ❌ |

## 🔗 Related

- **CLI tool**: [`@behave-ui/cli`](https://www.npmjs.com/package/@behave-ui/cli) — Copy components to your project
- **Documentation**: [GitHub Repository](https://github.com/HaruyaFujii/behave-ui)
- **Examples**: [Storybook](https://github.com/HaruyaFujii/behave-ui) (coming soon)

## 📄 License

MIT

---

Generated with ❤️ by [behave-ui](https://github.com/HaruyaFujii/behave-ui)
# @behave-ui/cli

**CLI for adding behave-ui components to your project**

A command-line interface for adding behavior-first React components with zero configuration. Copy components directly to your project with full source code control.

## ✨ Features

- 🚀 **Universal compatibility** — Works with `npx`, `yarn dlx`, and `pnpm dlx`
- 📦 **Zero dependencies** — Self-contained with embedded templates
- 🎯 **Shadcn/ui style** — Copy components, not import packages
- 🔧 **Full control** — Edit copied source code as needed
- ⚡ **Instant setup** — No configuration required

## 📥 Installation & Usage

### Quick Start

```bash
# npm/pnpm users
npx @behave-ui/cli@latest add async-button

# yarn users
yarn dlx @behave-ui/cli@latest add async-button

# Add multiple components
npx @behave-ui/cli@latest add async-button auto-form data-fetch
```

### Available Commands

```bash
# List all available components
npx @behave-ui/cli@latest list

# Add component(s) to your project
npx @behave-ui/cli@latest add [components...]

# Custom output directory
npx @behave-ui/cli@latest add async-button --out-dir ./my-components

# Overwrite existing files
npx @behave-ui/cli@latest add async-button --overwrite

# Show help
npx @behave-ui/cli@latest --help
```

## 🧩 Available Components

| Component | Description |
|-----------|-------------|
| `async-button` | A button that manages pending / success / error state automatically. |
| `auto-form` | Generate a complete form UI from a Zod schema (Zod v4 compatible). |
| `data-fetch` | Fetch data with built-in loading, error, and empty state handling. |

## 📂 Output Structure

Components are copied to your project with the following structure:

```
src/
├── components/
│   ├── ui/
│   │   ├── AsyncButton/
│   │   │   └── index.tsx
│   │   ├── AutoForm/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   ├── schema-utils.ts
│   │   │   └── field-renderers.tsx
│   │   └── DataFetch/
│   │       ├── index.tsx
│   │       ├── types.ts
│   │       ├── useDataFetch.ts
│   │       └── fallbacks.tsx
│   └── hooks/
│       └── useAsyncState.ts
```

## 🔧 Requirements

- React 18+
- TypeScript (recommended)
- Peer dependencies will be listed after component installation

## 📖 Examples

### Basic Usage

```bash
# Add AsyncButton to handle async operations
npx @behave-ui/cli@latest add async-button
```

```tsx
import { AsyncButton } from './components/ui/AsyncButton';

<AsyncButton
  onClick={async () => await api.submitForm(data)}
  loadingText="Submitting..."
  successText="Done!"
>
  Submit Form
</AsyncButton>
```

### Advanced Usage

```bash
# Add AutoForm for Zod v4 schema-based forms
npx @behave-ui/cli@latest add auto-form
```

```tsx
import { z } from 'zod';
import { AutoForm } from './components/ui/AutoForm';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

<AutoForm
  schema={schema}
  onSubmit={(data) => console.log(data)}
/>
```

## 🆚 Why CLI over npm package?

| CLI Approach | npm Package |
|--------------|-------------|
| ✅ Full source control | ❌ Black box dependency |
| ✅ Zero runtime deps | ❌ Bundle size impact |
| ✅ Customize freely | ❌ Limited customization |
| ✅ No version conflicts | ❌ Dependency hell risk |
| ✅ Tree-shake friendly | ❌ Bundle everything |

## 🔗 Related

- **Main package**: [`@behave-ui/react`](https://www.npmjs.com/package/@behave-ui/react) — For npm package installation
- **Documentation**: [GitHub Repository](https://github.com/HaruyaFujii/behave-ui)
- **Examples**: [Storybook](https://github.com/HaruyaFujii/behave-ui) (coming soon)

## 📄 License

MIT

---

Generated with ❤️ by [behave-ui](https://github.com/HaruyaFujii/behave-ui)
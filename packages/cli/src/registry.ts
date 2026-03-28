export interface ComponentMeta {
  name: string;
  description: string;
  /** Files to copy relative to packages/react/src/components/<name>/ */
  files: string[];
  /** Hooks to copy from packages/react/src/hooks/ */
  hooks?: string[];
  /** npm packages the component needs in the user's project */
  peerDeps: string[];
}

export const REGISTRY: Record<string, ComponentMeta> = {
  'async-button': {
    name: 'AsyncButton',
    description: 'A button that manages pending / success / error state automatically.',
    files: ['index.tsx'],
    hooks: ['useAsyncState.ts'],
    peerDeps: ['react', 'react-dom'],
  },
  'auto-form': {
    name: 'AutoForm',
    description: 'Generate a complete form UI from a Zod schema (Zod v4 compatible).',
    files: ['index.tsx', 'types.ts', 'schema-utils.ts', 'field-renderers.tsx'],
    hooks: ['useAsyncState.ts'],
    peerDeps: ['react', 'react-dom', 'zod', 'react-hook-form', '@hookform/resolvers'],
  },
  'data-fetch': {
    name: 'DataFetch',
    description: 'Fetch data with built-in loading, error, and empty state handling.',
    files: ['index.tsx', 'fallbacks.tsx', 'types.ts', 'useDataFetch.ts'],
    peerDeps: ['react', 'react-dom'],
  },
};

export const REGISTRY_KEYS = Object.keys(REGISTRY) as (keyof typeof REGISTRY)[];

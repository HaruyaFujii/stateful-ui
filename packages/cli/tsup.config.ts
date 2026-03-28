import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  publicDir: 'src/templates',
  banner: {
    js: '#!/usr/bin/env node',
  },
});

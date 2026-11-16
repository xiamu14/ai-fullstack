import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'scripts/**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts', 'scripts/**/*.ts'],
      exclude: ['src/main.ts', 'scripts/**/*.spec.ts'],
    },
  },
});

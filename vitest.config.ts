import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    isolate: true,

    include: ['**/*.spec.ts'],

    setupFiles: [
      path.resolve(__dirname, 'tests/setup/vitest.setup.ts'),
    ],

    includeSource: [
      'apps/server/src/**/*.{ts,js}',
      'packages/**/src/**/*.{ts,js}',
      'shared/src/**/*.{ts,js}',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],

      include: [
        'apps/server/src/**/*.{ts,js}',
        'packages/**/src/**/*.{ts,js}',
        'shared/src/**/*.{ts,js}',
      ],

      exclude: [
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/node_modules/**',
        'apps/**/dist/**',
        'apps/**/release/**',
      ],

      // Coverage enforcement (Vitest v4 way)
      thresholds: {
        statements: 5,
        branches: 5,
        functions: 5,
        lines: 5
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});

/* Flat ESLint configuration (ESLint v9+)
   - TypeScript support via @typescript-eslint
   - Enforces explicit import extensions for ESM/NodeNext
   - Ignored output/build folders
*/
module.exports = [
  // Ignore build artifacts
  {
    ignores: ['dist/**', 'release/**', 'node_modules/**'],
  },

  // Base rules applicable to JS/TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        tsconfigRootDir: __dirname,
        // Include the repo tsconfigs and the test-specific one so ESLint can parse test files & vitest config
        project: ['./tsconfig.json', './tsconfig.test.json', './tsconfig.eslint.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
      },
      globals: {
        // allow common globals - vitest globals added in override below
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      import: require('eslint-plugin-import'),
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx'],
        },
      },
    },
    rules: {
      // Enforce explicit import extensions to match NodeNext/ESM runtime. Ignore package imports (e.g. 'vitest/config').
      'import/extensions': ['error', 'always', { js: 'always', mjs: 'always', cjs: 'always', ts: 'never', tsx: 'never', jsx: 'never', ignorePackages: true }],
      // TypeScript resolver handles missing imports; avoid noisy errors
      'import/no-unresolved': 'off',
    },
    // Recommended base rules
    ignores: [],
  },

  // TypeScript-specific overrides
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Vitest / test files environment
  {
    files: ['**/*.spec.ts', 'tests/**'],
    languageOptions: {
      globals: {
        // vitest provides `describe`, `it`, `expect`, etc.
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      // no-op: vitest lint rules can be added if plugin is installed
    },
    // No per-test import extension override — tests should follow the same import-extension rules as source files.
  },

];

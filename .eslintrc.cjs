/* ESLint config for the monorepo
   - TypeScript via @typescript-eslint
   - Enforce explicit import extensions (ESM / NodeNext discipline)
   - Ignore build outputs
*/
module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  ignorePatterns: ['dist/', 'release/', 'node_modules/'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 2022,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
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
    // Require explicit extensions on imports (aligns with NodeNext / ESM). Developers should use `.js` for runtime imports.
    'import/extensions': ['error', 'always', { js: 'always', mjs: 'always', cjs: 'always', ts: 'always', tsx: 'always', jsx: 'always' }],
    // Sometimes typescript resolver is enough; turn this off to avoid false positives
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['**/*.spec.ts', 'tests/**'],
      env: { vitest: true },
      plugins: ['vitest'],
    },
  ],
};

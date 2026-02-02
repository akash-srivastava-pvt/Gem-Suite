# Unit Tests (Vitest)

This repository uses Vitest as a shared unit test runner for all packages. Tests follow these conventions:

- Files named `*.spec.ts`
- Business logic tests only (no UI or E2E)
- Shared setup lives in `tests/setup`

Run tests from the repo root:

- `npm test` (interactive)
- `npm run test:run` (run once)
- `npm run test:coverage` (run with coverage; coverage thresholds apply)

Husky hooks (when `npm run prepare` is executed):
- `pre-commit`: runs `lint-staged` and `npm run test:fast`
- `pre-push`: runs tests with coverage (`npm run test:coverage`)

Design notes:
- Use `vi.mock()` to mock databases, network, fs, and Electron IPC
- Use helpers in `tests/setup` for common mocks and fake timers

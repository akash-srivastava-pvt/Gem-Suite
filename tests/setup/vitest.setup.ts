import { beforeEach, afterEach, vi } from 'vitest';

// Basic global setup for unit tests (enable fake timers by default)
beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  // Use fake timers in tests by default so tests can advance time deterministically
  vi.useFakeTimers();
});

afterEach(() => {
  // flush any pending timers and restore real timers
  try {
    vi.runOnlyPendingTimers();
  } catch {}
  try {
    vi.useRealTimers();
  } catch {}
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

// Helpful global shims can be exported from here later (e.g. fake DB, IPC)
export {};

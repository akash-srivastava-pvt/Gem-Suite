import { vi } from 'vitest';

export function useFakeTime(now: number) {
  vi.useFakeTimers();
  vi.setSystemTime(now);
}

export function advanceTime(ms: number) {
  vi.advanceTimersByTime(ms);
}

export function restoreTime() {
  vi.useRealTimers();
}

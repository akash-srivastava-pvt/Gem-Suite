import { describe, it, expect, vi } from 'vitest';

/**
 * Minimal in-test Cache + Cacheable decorator example for docs and tests.
 * Demonstrates business-logic unit tests and use of fake timers from setup.
 */
class Cache {
  private store = new Map<string, { value: unknown; expiresAt?: number }>();

  set(key: string, value: unknown, ttlMs?: number) {
    const entry: { value: unknown; expiresAt?: number } = { value };
    if (ttlMs) entry.expiresAt = Date.now() + ttlMs;
    this.store.set(key, entry);
  }

  get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  clear() {
    this.store.clear();
  }
}

function Cacheable(ttlMs?: number) {
  const cache = new Cache();
  return function (_target: any, _prop: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const val = original.apply(this, args);
      cache.set(key, val, ttlMs);
      return val;
    };
  };
}

describe('Cacheable decorator', () => {
  it('caches result and respects TTL', () => {
    class Svc {
      count = 0;

      @Cacheable(1000)
      expensive(n: number) {
        this.count++;
        return n * 2;
      }
    }

    const svc = new Svc();

    expect(svc.expensive(2)).toBe(4);
    expect(svc.count).toBe(1);

    // second call returns cached value
    expect(svc.expensive(2)).toBe(4);
    expect(svc.count).toBe(1);

    // advance time beyond TTL and ensure recompute
    vi.advanceTimersByTime(1100);
    expect(svc.expensive(2)).toBe(4);
    expect(svc.count).toBe(2);
  });
});

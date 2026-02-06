import { describe, it, expect, beforeEach } from 'vitest';

// Do not depend on jsdom here — mock localStorage/sessionStorage before importing module
beforeEach(async () => {
  const fakeStorage = () => {
    const obj: Record<string, string> = {};
    return {
      getItem: (k: string) => (Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : null),
      setItem: (k: string, v: string) => { obj[k] = v; (globalThis as any).localStorage[k] = v; },
      removeItem: (k: string) => { delete obj[k]; delete (globalThis as any).localStorage[k]; },
      clear: () => { for (const k of Object.keys(obj)) { delete obj[k]; delete (globalThis as any).localStorage[k]; } }
    } as any;
  };

  (globalThis as any).localStorage = fakeStorage();
  (globalThis as any).sessionStorage = fakeStorage();
});

describe('Web storage utilities (no UI)', () => {
  it('formStorage save/load/clear should work', async () => {
    const mod = await import('../../../../apps/web/src/utils/storage.ts');
    const { formStorage } = mod;

    formStorage.save('testApp', { a: 1 });
    const loaded = formStorage.load('testApp', { a: 0 });
    expect(loaded.a).toBe(1);

    formStorage.clear('testApp');
    const after = formStorage.load('testApp', { a: 0 });
    expect(after.a).toBe(0);
  });

  it('aiCache set/get/clearApp should work within session', async () => {
    const mod = await import('../../../../apps/web/src/utils/storage.ts');
    const { aiCache } = mod;

    const keyInput = { prompt: 'hi' };
    aiCache.set('app1', keyInput, { text: 'result' });

    const val = aiCache.get('app1', keyInput);
    expect(val?.text).toBe('result');

    aiCache.clearApp('app1');
    expect(aiCache.get('app1', keyInput)).toBeNull();
  });
});
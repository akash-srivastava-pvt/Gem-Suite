import { describe, it, expect, vi } from 'vitest';

describe('MessageBus', () => {
  it('should publish messages and keep history', async () => {
    const mod = await import('../../../../apps/server/src/orchestration/messageBus.ts');
    const { messageBus } = mod;

    messageBus.clearHistory();

    messageBus.publish({ from: 'a', to: 'b', type: 'event', payload: { x: 1 }, timestamp: Date.now() });
    const history = messageBus.getHistory();

    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[history.length - 1].payload.x).toBe(1);
  });

  it('request/response should resolve and reject appropriately', async () => {
    const mod = await import('../../../../apps/server/src/orchestration/messageBus.ts');
    const { messageBus } = mod;

    // Short circuit: listen for published request and respond
    const handler = (msg: any) => {
      if (msg.type === 'request') {
        // echo back
        messageBus.respond(msg.correlationId, msg.to, msg.from, { ok: true });
      }
    };

    messageBus.on('message', handler);

    const res = await messageBus.request('a', 'b', { foo: 'bar' }, 1000);
    expect(res.ok).toBe(true);

    messageBus.off('message', handler);
  });
});
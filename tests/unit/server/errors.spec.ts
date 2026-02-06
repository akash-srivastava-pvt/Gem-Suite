import { describe, it, expect } from 'vitest';

describe('Error utilities', () => {
  it('should create AppError subclasses with correct status codes', async () => {
    const mod = await import('../../../../apps/server/src/utility/errors.ts');
    const { ValidationError, AuthenticationError, NotFoundError, ConflictError } = mod;

    const v = new ValidationError('invalid');
    expect(v.statusCode).toBe(400);

    const a = new AuthenticationError();
    expect(a.statusCode).toBe(401);

    const n = new NotFoundError();
    expect(n.statusCode).toBe(404);

    const c = new ConflictError('conf');
    expect(c.statusCode).toBe(409);
  });

  it('getErrorResponse returns proper responses', async () => {
    const mod = await import('../../../../apps/server/src/utility/errors.ts');
    const { ValidationError, getErrorResponse } = mod;

    const ve = new ValidationError('bad');
    const r1 = getErrorResponse(ve);
    expect(r1.statusCode).toBe(400);
    expect(r1.body.error).toBe('bad');

    const r2 = getErrorResponse(new Error('boom'));
    expect(r2.statusCode).toBe(500);
    expect(r2.body.error).toBe('Internal server error');
  });
});
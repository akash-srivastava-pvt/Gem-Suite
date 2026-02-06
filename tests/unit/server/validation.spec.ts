import { describe, it, expect } from 'vitest';

describe('Validation utilities', () => {
  it('isValidEmail should validate emails correctly', async () => {
    const mod = await import('../../../../apps/server/src/utility/validation.ts');
    const { isValidEmail, isValidApiKey, isValidDateFormat, isValidUrl, sanitizeString, validatePagination } = mod;

    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);

    expect(isValidApiKey('shortkey')).toBe(false);
    expect(isValidApiKey('x'.repeat(25))).toBe(true);

    expect(isValidDateFormat('2020-01-01')).toBe(true);
    expect(isValidDateFormat('2020-13-01')).toBe(false);
    expect(isValidDateFormat('not-a-date')).toBe(false);

    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('ftp://example')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);

    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString((123 as any))).toBe('');

    expect(validatePagination(0, 1000)).toEqual({ page: 1, limit: 100 });
    expect(validatePagination(2.7, 10.2)).toEqual({ page: 2, limit: 10 });
  });
});
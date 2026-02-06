import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../../packages/db/src/db.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Database model (lightweight tests)', () => {
  beforeEach(() => {
    // Ensure NODE_ENV not production for deterministic behavior
    delete process.env.NODE_ENV;
  });

  it('getDatabasePath returns cwd path in non-production', () => {
    const p = (db as any).getDatabasePath();
    expect(p).toContain('gem-suite.sqlite');
  });

  it('save is no-op when not initialized', () => {
    // Should not throw
    expect(() => (db as any).save()).not.toThrow();
  });

  it('query throws when not initialized', () => {
    expect(() => db.query('SELECT 1')).toThrow('Database not initialized');
  });

  it('run throws when not initialized', () => {
    expect(() => (db as any).run('SELECT 1')).toThrow('Database not initialized');
  });

  it('execute throws when not initialized (and save would be skipped)', () => {
    expect(() => (db as any).execute('SELECT 1')).toThrow('Database not initialized');
  });
});
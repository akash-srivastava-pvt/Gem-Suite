import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { encrypt, decrypt, clearMasterKeyCache, initEncryption } from '../../../apps/server/src/utility/security.js';

const tmpHome = path.join(process.cwd(), 'tmp_test_home');

describe('security encryption helpers', () => {
  beforeEach(() => {
    // Use a test home directory to avoid writing to real user folder
    process.env.HOME = tmpHome;
    if (fs.existsSync(tmpHome)) {
      fs.rmSync(tmpHome, { recursive: true, force: true });
    }
    clearMasterKeyCache();
    initEncryption(false);
  });

  afterEach(() => {
    clearMasterKeyCache();
    if (fs.existsSync(tmpHome)) {
      fs.rmSync(tmpHome, { recursive: true, force: true });
    }
  });

  it('encrypts and decrypts a string', async () => {
    const payload = 'the quick brown fox';
    const enc = await encrypt(payload);
    expect(typeof enc).toBe('string');

    const dec = await decrypt(enc);
    expect(dec).toBe(payload);
  });

  it('decrypt throws for corrupted payload', async () => {
    const bad = 'not-a-valid-payload';
    await expect(decrypt(bad)).rejects.toThrow();
  });

  it('works in electron mode fallback when keytar not present', async () => {
    initEncryption(true);
    const payload = 'electron-mode';
    const enc = await encrypt(payload);
    const dec = await decrypt(enc);
    expect(dec).toBe(payload);
  });
});
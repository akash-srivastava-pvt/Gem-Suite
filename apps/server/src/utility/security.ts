/**
 * Cross-platform encryption module
 * - Desktop (Electron): Uses keytar for secure storage
 * - Web: Uses file-based key storage (secured by server)
 */
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const ALGO = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const SERVICE_NAME = 'gem-suite';
const ACCOUNT_NAME = 'db-encryption-key';

let masterKey: Buffer | null = null;
let isElectron = false;

/**
 * Initialize encryption context
 */
export function initEncryption(electronMode: boolean = false) {
    isElectron = electronMode;
}

async function getOrCreateMasterKey(): Promise<Buffer> {
    if (masterKey) {
        return masterKey;
    }

    let key: string | null = null;

    if (isElectron) {
        // In Electron: Try to use keytar first
        try {
            const keytar = await import('keytar');
            key = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);

            if (!key) {
                const newKey = crypto.randomBytes(KEY_LENGTH).toString('hex');
                await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, newKey);
                key = newKey;
            }
        } catch (error) {
            console.warn('Keytar not available, using fallback key storage');
            // Fallback to file-based storage in Electron
            key = getOrCreateFileBasedKey();
        }
    } else {
        // Web environment: use file-based key (secured by server)
        key = getOrCreateFileBasedKey();
    }

    masterKey = Buffer.from(key, 'hex');
    return masterKey;
}

function getOrCreateFileBasedKey(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
    const keyDir = path.join(homeDir, '.gem-suite');

    if (!fs.existsSync(keyDir)) {
        fs.mkdirSync(keyDir, { recursive: true });
    }

    const keyPath = path.join(keyDir, '.encryption-key');

    if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf-8').trim();
    }

    const newKey = crypto.randomBytes(KEY_LENGTH).toString('hex');
    fs.writeFileSync(keyPath, newKey, { mode: 0o600 }); // Read/write by owner only

    return newKey;
}

export async function encrypt(text: string): Promise<string> {
    const key = await getOrCreateMasterKey();

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export async function decrypt(payload: string): Promise<string> {
    const key = await getOrCreateMasterKey();

    const data = Buffer.from(payload, 'base64');

    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);

    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);

    try {
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('Decryption failed: Invalid payload or corrupted data');
    }
}

/**
 * Clear the cached master key (for testing or re-initialization)
 */
export function clearMasterKeyCache() {
    masterKey = null;
}

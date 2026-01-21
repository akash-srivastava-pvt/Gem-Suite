import { db } from "@gem/db";
import { decrypt } from "./security.js";

/**
 * Validate Gemini API key with retry logic
 */
const validateGeminiApiKey = async (apiKey: string, retries: number = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`,
                {
                    method: 'GET',
                }
            );

            if (response.ok) {
                return true;
            }

            if (response.status === 401 || response.status === 403) {
                return false; // Invalid key, don't retry
            }

            // For other errors, retry
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }
        } catch (error) {
            console.warn(`Validation attempt ${attempt} failed:`, error);

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }
        }
    }

    return false;
};


async function getApiKey(): Promise<string> {
    const newKeys = db.query<{ encrypted_api_key: string }>(
        'SELECT encrypted_api_key FROM user_api_keys WHERE user_id = 1 AND is_active = 1 ORDER BY is_default DESC LIMIT 1'
    );

    if (newKeys.length === 0) {
        throw new Error('No API key configured. Please add an API key in Profile settings.');
    }

    try {
        return await decrypt(newKeys[0].encrypted_api_key);
    } catch (decryptError) {
        // Handle unencrypted keys from migration
        return newKeys[0].encrypted_api_key;
    }
}

export { validateGeminiApiKey, getApiKey };
import { db } from "@gem/db";
import { Activate } from "@gem/shared";
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
    const activate = await db.query<Activate>("SELECT apiKey FROM activate WHERE id=1 LIMIT 1");
    const key = activate[0].apiKey;
    const decryptedKey = await decrypt(key);
    return decryptedKey;
}

export { validateGeminiApiKey, getApiKey };
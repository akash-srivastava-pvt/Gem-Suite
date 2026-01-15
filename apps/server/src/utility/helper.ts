import { db } from "@gem/db";
import { Activate } from "@gem/shared";
import { decrypt } from "./security.js";
import { UserModel } from "../models/userModel.js";
import { callGemini as callGemini2 } from "../proxies/gemini2.js";
import { callGemini as callGemini3 } from "../proxies/gemini3.js";
import { callGemini as callGemini2Img } from "../proxies/gemini2img.js";
import { callGemini as callGemini3Img } from "../proxies/gemini3img.js";
import { GeminiResponse, GeminiImgResponse } from "@gem/shared";

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

/**
 * Get the appropriate Gemini proxy function based on user preference (for text generation)
 */
async function callGeminiWithUserPreference(apiKey: string, prompt: string): Promise<GeminiResponse> {
    const version = UserModel.getGeminiVersion();
    if (version === '3') {
        return callGemini3(apiKey, prompt);
    }
    return callGemini2(apiKey, prompt);
}

/**
 * Get the appropriate Gemini image proxy function based on user preference (for image generation)
 */
async function callGeminiImageWithUserPreference(apiKey: string, prompt: string): Promise<GeminiImgResponse> {
    const version = UserModel.getGeminiVersion();
    if (version === '3') {
        return callGemini3Img(apiKey, prompt);
    }
    return callGemini2Img(apiKey, prompt);
}

export { validateGeminiApiKey, getApiKey, callGeminiWithUserPreference, callGeminiImageWithUserPreference };
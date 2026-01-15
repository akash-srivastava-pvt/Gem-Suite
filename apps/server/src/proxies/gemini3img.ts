import { GeminiImgResponse } from "@gem/shared";

const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent";

const REQUEST_TIMEOUT = 45_000;
const MAX_RETRIES = 2;

export async function callGemini(
    apiKey: string,
    prompt: string
): Promise<GeminiImgResponse> {
    if (!apiKey || !prompt) {
        throw new Error("API key and prompt are required");
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT
        );

        try {
            const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        responseModalities: ["IMAGE"],
                    },
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // ─────────────────────────────────────────
            // HTTP ERROR HANDLING
            // ─────────────────────────────────────────
            if (!response.ok) {
                const status = response.status;
                const errorText = await response.text();

                if (status === 401 || status === 403) {
                    throw new Error("Invalid Gemini API key");
                }

                if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
                    const backoffMs = 3000 * (attempt + 1);
                    await new Promise((r) =>
                        setTimeout(r, backoffMs)
                    );
                    continue;
                }

                throw new Error(
                    `Gemini request failed (${status}): ${errorText}`
                );
            }

            // ─────────────────────────────────────────
            // IMAGE RESPONSE PARSING
            // ─────────────────────────────────────────
            const resData = await response.json();

            const imagePart =
                resData?.candidates?.[0]?.content?.parts?.find(
                    (p: any) => p.inlineData
                );

            if (!imagePart?.inlineData?.data) {
                throw new Error("No image returned from Gemini");
            }

            return {
                image: {
                    mimeType: imagePart.inlineData.mimeType,
                    base64: imagePart.inlineData.data,
                },
            };

        } catch (err: any) {
            clearTimeout(timeoutId);

            if (err.name === "AbortError") {
                if (attempt < MAX_RETRIES) {
                    const backoffMs = 3000 * (attempt + 1);
                    await new Promise((r) =>
                        setTimeout(r, backoffMs)
                    );
                    continue;
                }
                throw new Error("Gemini request timed out");
            }

            if (attempt < MAX_RETRIES) {
                const backoffMs = 3000 * (attempt + 1);
                await new Promise((r) =>
                    setTimeout(r, backoffMs)
                );
                continue;
            }

            throw err;
        }
    }

    throw new Error("Gemini request failed after retries");
}


/**
 * Robust JSON parser for AI-generated responses
 * Handles malformed JSON, markdown code blocks, and common AI response issues
 */

/**
 * Extract and parse JSON from AI response
 * Handles:
 * - Markdown code blocks (```json ... ```)
 * - Incomplete JSON strings
 * - Trailing commas
 * - Comments
 * - Escaped characters
 */
export function parseAIJSON(response: string): any {
    if (!response || typeof response !== 'string') {
        throw new Error('Invalid response: empty or not a string');
    }

    // Step 1: Remove markdown code blocks
    let cleaned = response.trim();
    
    // Remove ```json and ``` markers
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    // Step 2: Find JSON object boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    // Determine if it's an object or array
    let jsonStart = -1;
    let jsonEnd = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        // It's an object
        jsonStart = firstBrace;
        jsonEnd = lastBrace + 1;
    } else if (firstBracket !== -1) {
        // It's an array
        jsonStart = firstBracket;
        jsonEnd = lastBracket + 1;
    }

    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON structure found in response');
    }

    // Extract the JSON portion
    let jsonString = cleaned.substring(jsonStart, jsonEnd);

    // Step 3: Fix common JSON issues
    // Remove trailing commas before } or ]
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix unescaped newlines in strings
    jsonString = jsonString.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
        // Check if string contains unescaped newlines
        if (match.includes('\n') && !match.includes('\\n')) {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        }
        return match;
    });

    // Remove single-line comments (// ...)
    jsonString = jsonString.replace(/\/\/.*$/gm, '');

    // Step 4: Try to parse
    try {
        return JSON.parse(jsonString);
    } catch (error: any) {
        // If parsing fails, try to fix more issues
        try {
            // Try to fix unterminated strings by finding the end of the string
            const fixed = fixUnterminatedString(jsonString);
            return JSON.parse(fixed);
        } catch (secondError) {
            console.error('JSON Parse Error:', {
                original: response.substring(0, 200),
                cleaned: jsonString.substring(0, 200),
                error: error.message,
                position: error.message.match(/position (\d+)/)?.[1]
            });
            throw new Error(`Failed to parse JSON: ${error.message}. Response preview: ${jsonString.substring(0, 100)}...`);
        }
    }
}

/**
 * Fix unterminated strings in JSON
 */
function fixUnterminatedString(json: string): string {
    let fixed = json;
    let inString = false;
    let escapeNext = false;
    let stringStart = -1;

    for (let i = 0; i < fixed.length; i++) {
        const char = fixed[i];
        const prevChar = i > 0 ? fixed[i - 1] : '';

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringStart = i;
            } else {
                inString = false;
                stringStart = -1;
            }
        }

        // If we're at the end and still in a string, try to close it
        if (i === fixed.length - 1 && inString && stringStart !== -1) {
            // Check if we're inside a value (after a colon)
            const beforeString = fixed.substring(0, stringStart);
            const lastColon = beforeString.lastIndexOf(':');
            if (lastColon !== -1) {
                // We're in a value, close the string
                fixed = fixed + '"';
                break;
            }
        }
    }

    return fixed;
}

/**
 * Extract text content from JSON response (for cover letter, SOP, etc.)
 */
export function extractTextContent(response: string, fieldName: string = 'content'): string {
    try {
        const parsed = parseAIJSON(response);
        
        // Try different possible field names
        if (parsed[fieldName]) {
            return parsed[fieldName];
        }
        if (parsed.content) {
            return parsed.content;
        }
        if (parsed.text) {
            return parsed.text;
        }
        if (typeof parsed === 'string') {
            return parsed;
        }
        
        // If it's an object, try to stringify and extract
        const stringified = JSON.stringify(parsed, null, 2);
        return stringified;
    } catch (error) {
        // If JSON parsing fails, try to extract text directly
        // Remove markdown code blocks
        let cleaned = response.replace(/```json|```/g, '').trim();
        
        // Try to find text between quotes
        const textMatch = cleaned.match(/"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
        if (textMatch) {
            return textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        
        // Fallback: return cleaned response
        return cleaned;
    }
}


/**
 * Client-side storage utility for form persistence and AI content caching
 * Cache is cleared on app close/session end
 */

const STORAGE_PREFIX = 'gem-suite';
const SESSION_KEY = `${STORAGE_PREFIX}:session-id`;

// Generate or retrieve session ID
function getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

// Clear all caches when session ends
function clearSessionCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(`${STORAGE_PREFIX}:cache:`)) {
            localStorage.removeItem(key);
        }
    });
}

// Set up beforeunload listener to clear cache
if (typeof window !== 'undefined') {
    // Clear any old session caches on initialization
    const currentSessionId = getSessionId();
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(`${STORAGE_PREFIX}:cache:`)) {
            try {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    // Clear caches from previous sessions
                    if (parsed.sessionId !== currentSessionId) {
                        localStorage.removeItem(key);
                    }
                }
            } catch {
                // If parsing fails, remove the corrupted entry
                localStorage.removeItem(key);
            }
        }
    });

    // Clear cache on app close
    window.addEventListener('beforeunload', () => {
        clearSessionCache();
    });

    // Also clear on pagehide (for mobile/SPA navigation)
    window.addEventListener('pagehide', () => {
        clearSessionCache();
    });
}

/**
 * Form persistence utilities
 */
export const formStorage = {
    /**
     * Save form data to localStorage
     */
    save<T>(appName: string, data: T): void {
        try {
            const key = `${STORAGE_PREFIX}:form:${appName}`;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`Failed to save form data for ${appName}:`, error);
        }
    },

    /**
     * Load form data from localStorage
     */
    load<T>(appName: string, defaultValue: T): T {
        try {
            const key = `${STORAGE_PREFIX}:form:${appName}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (error) {
            console.warn(`Failed to load form data for ${appName}:`, error);
        }
        return defaultValue;
    },

    /**
     * Clear form data
     */
    clear(appName: string): void {
        const key = `${STORAGE_PREFIX}:form:${appName}`;
        localStorage.removeItem(key);
    }
};

/**
 * AI content caching utilities
 * Cache is cleared on app close/session end
 */
export const aiCache = {
    /**
     * Generate cache key from app name and input data
     */
    generateKey(appName: string, input: any): string {
        const sessionId = getSessionId();
        const inputHash = JSON.stringify(input);
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < inputHash.length; i++) {
            const char = inputHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `${STORAGE_PREFIX}:cache:${appName}:${sessionId}:${hash}`;
    },

    /**
     * Get cached AI content
     */
    get<T>(appName: string, input: any): T | null {
        try {
            const key = this.generateKey(appName, input);
            const cached = localStorage.getItem(key);
            if (cached) {
                const parsed = JSON.parse(cached);
                // Check if cache is still valid (same session)
                const sessionId = getSessionId();
                if (parsed.sessionId === sessionId) {
                    return parsed.data as T;
                }
            }
        } catch (error) {
            console.warn(`Failed to get cache for ${appName}:`, error);
        }
        return null;
    },

    /**
     * Set cached AI content
     */
    set<T>(appName: string, input: any, data: T): void {
        try {
            const key = this.generateKey(appName, input);
            const sessionId = getSessionId();
            const cacheData = {
                sessionId,
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.warn(`Failed to set cache for ${appName}:`, error);
            // If storage is full, try to clear old caches
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                clearSessionCache();
            }
        }
    },

    /**
     * Clear all caches for current session
     */
    clearSession(): void {
        clearSessionCache();
    },

    /**
     * Clear cache for specific app
     */
    clearApp(appName: string): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(`${STORAGE_PREFIX}:cache:${appName}:`)) {
                localStorage.removeItem(key);
            }
        });
    }
};


/**
 * Simple in-memory cache utility with TTL support
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class Cache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private ttl: number; // milliseconds

    constructor(ttlMs: number = 60000) {
        this.ttl = ttlMs;
    }

    /**
     * Get value from cache if it exists and is not expired
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if entry has expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set value in cache
     */
    set(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete entry from cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Auto-cleanup expired entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * Decorator for caching async function results
 */
export function Cacheable(ttlMs: number = 60000) {
    const cache = new Cache<any>(ttlMs);

    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // Create cache key from function name and arguments
            const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

            // Try to get from cache
            const cached = cache.get(cacheKey);
            if (cached !== null) {
                return cached;
            }

            // Call original method
            const result = await originalMethod.apply(this, args);

            // Store in cache
            cache.set(cacheKey, result);

            return result;
        };

        return descriptor;
    };
}

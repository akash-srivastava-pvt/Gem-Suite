/**
 * Common validation utilities
 */

import { URL } from 'url';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    return apiKey.trim().length >= 20; // Most API keys are fairly long
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return false;
    }
    const d = new Date(date);
    return !isNaN(d.getTime());
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize string input (basic protection)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
        return '';
    }
    return input.trim().substring(0, maxLength);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number) {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    return { page: validPage, limit: validLimit };
}

/**
 * Sanitizes user input for trip payload
 * - trims spaces
 * - removes extra slashes
 * - normalizes casing
 * - prevents malformed "A/B/C/D" values
 */

export function sanitize(value: string): string {
  if (!value || typeof value !== 'string') return '';

  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\//g, '') // prevent breaking Attraction/City/State format
    .replace(/[^\w\s\-]/g, ''); // remove unsafe chars
}

export function title(value: string): string {
  return sanitize(value)
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function upper(value: string): string {
  return sanitize(value).toUpperCase();
}

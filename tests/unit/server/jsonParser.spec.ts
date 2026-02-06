import { describe, it, expect } from 'vitest';
import { parseAIJSON, extractTextContent } from '../../../apps/server/src/utility/jsonParser.js';

describe('JSON parser utilities', () => {
  it('parses a simple JSON object', () => {
    const res = '{"name":"Alice","age":30}';
    expect(parseAIJSON(res)).toEqual({ name: 'Alice', age: 30 });
  });

  it('parses JSON inside a ```json code block', () => {
    const res = "```json\n{\n  \"ok\": true\n}\n```";
    expect(parseAIJSON(res)).toEqual({ ok: true });
  });

  it('fixes trailing commas and comments', () => {
    const res = '{"a":1, // comment\n "b":2,}';
    expect(parseAIJSON(res)).toEqual({ a: 1, b: 2 });
  });

  it('fixes unescaped newlines inside strings', () => {
    const res = '{"text":"line1\\nline2"}';
    // The input has an actual newline char, simulate under-escaped string
    const raw = `{"text":"line1
line2"}`;
    // Both should parse to a string containing an actual newline character
    expect(parseAIJSON(raw)).toEqual({ text: 'line1\nline2' });
    expect(parseAIJSON(res)).toEqual({ text: 'line1\nline2' });
  });

  it('throws when strings are clearly unterminated', () => {
    const raw = '{"text":"unterminated}';
    expect(() => parseAIJSON(raw)).toThrow();
  });

  it('extractTextContent prefers a field name', () => {
    const res = '{"content":"Hello","extra":"x"}';
    expect(extractTextContent(res, 'content')).toBe('Hello');
  });

  it('extractTextContent falls back when parsing fails', () => {
    const res = '```json\n"content":"Hi there"\n```';
    expect(extractTextContent(res)).toContain('Hi there');
  });
});
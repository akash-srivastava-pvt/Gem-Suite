import { useState, useCallback, useRef } from 'react';
import { textEditorService } from '../services/textEditorService.js';

export function useInlineAutocomplete() {
  const [suggestion, setSuggestion] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef<number>(0);

  const fetchSuggestion = useCallback(async (content: string, cursorPosition?: number) => {
    if (!content.trim()) return;

    // Cancellation: Abort any pending request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Throttle: Ensure at least 1.5s between starting successful requests
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 1500) {
      return;
    }

    // Slice content up to cursor if provided
    const relevantContent = cursorPosition !== undefined ? content.slice(0, cursorPosition) : content;

    // Autocomplete focus: last sentence, or last 500 chars if fresh line/sentence
    const sentences = relevantContent.split(/[.!?\n]/);
    let contextText = sentences[sentences.length - 1].trim();

    if (!contextText) {
      contextText = relevantContent.slice(-500).trim();
    }

    if (!contextText || contextText.length < 5) return; // Don't fetch for very short context

    try {
      lastRequestTimeRef.current = Date.now();
      const result = await textEditorService.query({
        intent: 'autocomplete',
        text: contextText,
      }, abortControllerRef.current.signal);

      setSuggestion(result);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setSuggestion('');
      }
    }
  }, []);

  const triggerAutocomplete = (text: string, delay: number = 1000, cursorPosition?: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // We don't clear the suggestion immediately to avoid flickering, 
    // but we can clear it if the text significantly changed

    timeoutRef.current = setTimeout(() => {
      fetchSuggestion(text, cursorPosition);
    }, delay);
  };

  const clearSuggestion = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setSuggestion('');
  };

  return { suggestion, triggerAutocomplete, clearSuggestion, setSuggestion };
}
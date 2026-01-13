import { useState, useCallback, useRef } from 'react';
import { textEditorService } from '../services/textEditorService.js';

export function useInlineAutocomplete() {
  const [suggestion, setSuggestion] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestion = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Autocomplete focus: just the last sentence
    const sentences = content.split(/[.!?]/);
    const lastSentence = sentences[sentences.length - 1].trim();
    if (!lastSentence) return;

    try {
      const result = await textEditorService.query({
        intent: 'autocomplete',
        text: lastSentence,
      });
      setSuggestion(result);
    } catch (e) {
      setSuggestion('');
    }
  }, []);

  const triggerAutocomplete = (text: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSuggestion('');
    
    timeoutRef.current = setTimeout(() => {
      fetchSuggestion(text);
    }, 800);
  };

  const clearSuggestion = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSuggestion('');
  };

  return { suggestion, triggerAutocomplete, clearSuggestion, setSuggestion };
}
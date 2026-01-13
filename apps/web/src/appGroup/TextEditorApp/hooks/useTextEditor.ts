import { useState, useRef } from 'react';
import { useInlineAutocomplete } from './useInlineAutocomplete.js';
import { useAtCommand } from './useAtCommand.js';
import { useSelection } from './useSelection.js';

export type EditorMode = 'idle' | 'typing' | 'autocomplete' | 'command' | 'selection';

export function useTextEditor() {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<EditorMode>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { suggestion, triggerAutocomplete, clearSuggestion, setSuggestion } = useInlineAutocomplete();
  const { executeCommand, isProcessing } = useAtCommand();
  const { selection, updateSelection, setSelection } = useSelection();

  const handleTextChange = (val: string) => {
    setContent(val);
    
    const words = val.split(/\s/);
    const lastWord = words[words.length - 1];
    const isAtEnd = textareaRef.current ? textareaRef.current.selectionStart === val.length : false;
    
    // Strict Guard: If user is typing a command, kill autocomplete intent
    if (lastWord.includes('@')) {
      setMode('command');
      clearSuggestion();
    } else if (isAtEnd && val.length > 0) {
      setMode('typing');
      triggerAutocomplete(val);
    } else {
      setMode('idle');
      clearSuggestion();
    }
  };

  return {
    content,
    setContent,
    mode,
    setMode,
    textareaRef,
    suggestion,
    handleTextChange,
    clearSuggestion,
    selection,
    updateSelection,
    executeCommand,
    setSelection,
    isProcessing,
    setSuggestion
  };
}
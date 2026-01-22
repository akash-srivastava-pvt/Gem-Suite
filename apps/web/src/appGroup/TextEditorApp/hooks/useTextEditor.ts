import { useState, useRef, useEffect, useCallback } from 'react';
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

  const processChanges = useCallback((val: string) => {
    const words = val.split(/\s/);
    const lastWord = words[words.length - 1];
    const isAtEnd = textareaRef.current ? textareaRef.current.selectionStart === val.length : true;

    const isSlashCommand = words.some(w => w.startsWith('//')) || val.split('\n').some(line => line.trim().startsWith('//'));

    if (isSlashCommand) {
      setMode('command');
      clearSuggestion();
    } else if (val.length > 0) {
      setMode('typing');
      const delay = (val.endsWith(' ') || val.endsWith('\n')) ? 400 : 1200;
      const cursor = textareaRef.current?.selectionStart || 0;
      triggerAutocomplete(val, delay, cursor);
    } else {
      setMode('idle');
      clearSuggestion();
    }
  }, [triggerAutocomplete, clearSuggestion]);

  // Handle both manual and programmatic changes
  const handleTextChange = (val: string) => {
    setContent(val);
    processChanges(val);
  };

  const smartSetContent = (val: string) => {
    setContent(val);
    processChanges(val);
  };

  return {
    content,
    setContent: smartSetContent,
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
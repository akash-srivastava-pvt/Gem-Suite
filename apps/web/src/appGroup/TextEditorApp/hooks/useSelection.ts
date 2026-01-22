import { useState, useCallback } from 'react';

export interface SelectionState {
  text: string;
  start: number;
  end: number;
  rect: { top: number; left: number } | null;
}

export function useSelection() {
  const [selection, setSelection] = useState<SelectionState>({
    text: '',
    start: 0,
    end: 0,
    rect: null,
  });

  const updateSelection = useCallback((textarea: HTMLTextAreaElement) => {
    const { selectionStart, selectionEnd, value } = textarea;
    
    if (selectionStart !== selectionEnd) {
      // Simplified UI positioning based on textarea container
      setSelection({
        text: value.substring(selectionStart, selectionEnd),
        start: selectionStart,
        end: selectionEnd,
        rect: { top: 100, left: 100 } // In production, use a span-mirror for precise coords
      });
    } else {
      setSelection({ text: '', start: 0, end: 0, rect: null });
    }
  }, []);

  return { selection, updateSelection, setSelection };
}
import React, { useState } from 'react';
import { useTextEditor } from '../hooks/useTextEditor.js';
import { GhostOverlay } from './GhostOverlay.jsx';
import { SelectionMenu } from './SelectionMenu.jsx';
import { CommandHint } from './CommandHint.jsx';

export const TextEditorMain: React.FC = () => {
  const {
    content, setContent, mode, setMode, textareaRef, suggestion,
    handleTextChange, clearSuggestion, executeCommand, isProcessing,
    setSuggestion, selection, updateSelection, setSelection
  } = useTextEditor();

  const [generationPreview, setGenerationPreview] = useState('');

  const triggerGeneration = async () => {
    const result = await executeCommand(content);
    if (result) {
      setGenerationPreview(result);
    }
  };

  const handleAccept = () => {
    const lines = content.split('\n');
    const lastLine = lines[lines.length - 1];
    const lastWord = lastLine.split(/\s/).pop() || "";

    let newContent = "";
    if (lastLine.trim().startsWith('//')) {
      // Remove whole line for //
      lines.pop();
      newContent = lines.join('\n') + (lines.length > 0 ? "\n" : "") + generationPreview;
    } else {
      // Remove only the @word for @ commands
      const lastAtIdx = content.lastIndexOf('@');
      newContent = content.slice(0, lastAtIdx) + generationPreview;
    }

    setContent(newContent);
    setGenerationPreview('');
    setMode('idle');
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setContent(content + suggestion);
      setSuggestion('');
      return;
    }

    if (e.key === 'Enter') {
      const lines = content.split('\n');
      const lastLine = lines[lines.length - 1];
      const lastWord = lastLine.split(/\s/).pop() || "";

      if (lastLine.trim().startsWith('//') || lastWord.startsWith('@')) {
        e.preventDefault();
        triggerGeneration();
      }
    }

    if (e.key === 'Escape') {
      setGenerationPreview('');
      clearSuggestion();
      setMode('idle');
    }
  };

  return (
    <div className="likhit-editor-container">
      <div className="editor-wrapper">
        <GhostOverlay content={content} suggestion={suggestion} />
        <textarea
          ref={textareaRef}
          className="main-textarea"
          value={content}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={() => {
            if (textareaRef.current) {
              updateSelection(textareaRef.current);
              if (textareaRef.current.selectionStart !== textareaRef.current.selectionEnd) {
                setMode('selection');
              }
            }
          }}
          spellCheck={false}
        />

        {/* Processing Indicator */}
        {isProcessing && !generationPreview && <CommandHint isProcessing={true} />}

        {/* Unified Generation Modal for @ and // */}
        {generationPreview && (
          <div className="selection-menu generation-modal">
            <div className="preview-header">AI DRAFT</div>
            <div className="preview-overlay">
              {isProcessing ? 'Thinking...' : generationPreview}
            </div>
            <div className="preview-actions">
              <button className="menu-item accept-btn" onClick={handleAccept}>Accept</button>
              <button className="menu-item" onClick={triggerGeneration}>Regenerate</button>
              <button className="menu-item discard-btn" onClick={() => setGenerationPreview('')}>Discard</button>
            </div>
          </div>
        )}

        {/* Selection Menu */}
        {mode === 'selection' && selection.text && !generationPreview && (
          <SelectionMenu 
            selection={selection} 
            onConfirm={(text) => {
              const updated = content.substring(0, selection.start) + text + content.substring(selection.end);
              setContent(updated);
              setSelection({ ...selection, text: '', rect: null });
              setMode('idle');
            }}
            onClose={() => setMode('idle')}
          />
        )}
      </div>
    </div>
  );
};
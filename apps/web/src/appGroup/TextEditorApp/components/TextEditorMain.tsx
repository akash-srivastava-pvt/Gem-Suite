import React, { useState } from 'react';
import { useTextEditor } from '../hooks/useTextEditor.js';
import { GhostOverlay } from './GhostOverlay.jsx';
import { SelectionMenu } from './SelectionMenu.jsx';
import { CommandHint } from './CommandHint.jsx';

import { theme } from "../../../theme.js";

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
    let newContent = "";
    if (lastLine.trim().startsWith('//')) {
      lines.pop();
      newContent = lines.join('\n') + (lines.length > 0 ? "\n" : "") + generationPreview;
    } else {
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
    <div className="likhit-app-container">
      <div className="likhit-editor-container" style={{ margin: '32px auto', flex: 1 }}>
        <div style={{ padding: '24px 32px 0', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: theme.colors.primary }}>Likhit AI Editor</h2>
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '16px' }}>Type @ to generate or // for commands</p>
          </div>
          {isProcessing && !generationPreview && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinning-loader" /> AI is thinking...
            </div>
          )}
        </div>

        <div className="editor-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
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
            placeholder="Start writing here..."
          />

          {/* AI Drafting Overlay */}
          {generationPreview && (
            <div className="generation-modal" style={{ animation: 'menuAppear 0.3s ease' }}>
              <div className="preview-header">✨ AI Generated Draft</div>
              <div className="preview-overlay">
                {isProcessing ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>AI is refining the text...</div>
                ) : generationPreview}
              </div>
              <div className="preview-actions">
                <button
                  className="menu-item accept-btn"
                  style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
                  onClick={handleAccept}
                >
                  Accept & Insert
                </button>
                <button
                  className="menu-item"
                  style={{ flex: 1, justifyContent: 'center', border: `1px solid ${theme.colors.border}` }}
                  onClick={triggerGeneration}
                >
                  Regenerate
                </button>
                <button
                  className="menu-item discard-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setGenerationPreview('')}
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Selection Tooltip */}
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

          {/* Bottom Hint */}
          {!isProcessing && !generationPreview && <CommandHint isProcessing={false} />}
        </div>
      </div>
    </div>
  );
};
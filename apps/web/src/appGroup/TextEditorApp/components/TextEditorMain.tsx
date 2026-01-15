import React, { useState } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
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

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleExportPdf = () => {
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'serif';
    element.style.lineHeight = '1.6';
    element.style.whiteSpace = 'pre-wrap';
    element.innerText = content;

    const opt = {
      margin: 1,
      filename: 'likhit-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

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

    // We need to find the trigger and replace it. 
    // Since we don't have the exact parse result here, we use common triggers
    if (lastLine.trim().startsWith('//')) {
      lines.pop();
      newContent = lines.join('\n') + (lines.length > 0 ? "\n" : "") + generationPreview;
    } else {
      newContent = content + (content.endsWith('\n') ? '' : '\n') + generationPreview;
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
      // Trigger if it's a command line
      if (lastLine.trim().startsWith('//')) {
        e.preventDefault();
        triggerGeneration();
        return;
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
      <div className="likhit-editor-container" style={{ margin: '32px auto', flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: theme.colors.primary, letterSpacing: '-0.5px' }}>Likhit AI Editor</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: theme.colors.textSecondary, background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{wordCount} words</span>
              <span style={{ fontSize: '10px', color: theme.colors.textSecondary, background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>~{readingTime} min read</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleExportPdf}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border}`,
                background: 'white',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f9f9f9'; e.currentTarget.style.borderColor = theme.colors.primary; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = theme.colors.border; }}
            >
              📥 Save as PDF
            </button>
            {isProcessing && !generationPreview && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinning-loader" /> AI is thinking...
              </div>
            )}
          </div>
        </div>

        <div className="editor-wrapper" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
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
            placeholder="Start writing... Type // for help or use the selection menu."
            style={{
              lineHeight: '1.8',
              fontSize: '16px',
              fontFamily: 'serif',
              padding: '40px',
              minHeight: '100%',
              display: 'block',
              width: '100%'
            }}
          />

          {/* AI Drafting Overlay */}
          {generationPreview && (
            <div className="generation-modal" style={{ animation: 'menuAppear 0.3s ease' }}>
              <div className="preview-header">✨ AI Generated Draft</div>
              <div className="preview-overlay" style={{ maxHeight: '300px', overflowY: 'auto', fontStyle: 'italic', color: '#444' }}>
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
                  onClick={() => { setGenerationPreview(''); setMode('idle'); }}
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
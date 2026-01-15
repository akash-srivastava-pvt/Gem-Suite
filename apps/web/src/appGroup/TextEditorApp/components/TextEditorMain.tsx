import React, { useState } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useTextEditor } from '../hooks/useTextEditor.js';
import { GhostOverlay } from './GhostOverlay.js';
import { SelectionMenu } from './SelectionMenu.js';
import { CommandHint } from './CommandHint.js';
import { useShell } from '../../../context/ShellContext.js';

export const TextEditorMain: React.FC = () => {
  const { setHeaderActions } = useShell();
  const {
    content, setContent, mode, setMode, textareaRef, suggestion,
    handleTextChange, clearSuggestion, executeCommand, isProcessing,
    setSuggestion, selection, updateSelection, setSelection
  } = useTextEditor();

  const [generationPreview, setGenerationPreview] = useState('');

  // Auto-resize textarea
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
    element.style.padding = '60px 80px';
    element.style.fontFamily = "'Lora', 'Georgia', serif";
    element.style.lineHeight = '1.8';
    element.style.fontSize = '18px';
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

  // Sync with Shell Header
  React.useEffect(() => {
    setHeaderActions(
      <>
        <div style={headerStyles.stats}>
          <span style={headerStyles.badge}>{wordCount} words</span>
          <span style={headerStyles.badge}>{readingTime} min read</span>
        </div>
        {isProcessing && !generationPreview && (
          <div style={headerStyles.processing}>
            <span className="spinning-loader" style={{ marginRight: '8px' }} />
            AI is thinking...
          </div>
        )}
        <button
          className="secondary-btn"
          onClick={handleExportPdf}
          style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
        >
          📥 Export PDF
        </button>
      </>
    );
    return () => setHeaderActions(null);
  }, [wordCount, readingTime, isProcessing, generationPreview]);

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
    <div className="likhit-viewport">
      <div className="editor-sheet">
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
          placeholder="Start writing your masterpiece here..."
        />

        {/* AI Drafting Overlay */}
        {generationPreview && (
          <div className="generation-modal">
            <div className="preview-header">✨ AI ASSISTANT PROPOSAL</div>
            <div className="preview-overlay">
              {isProcessing ? "Refining text..." : generationPreview}
            </div>
            <div className="preview-actions">
              <button className="menu-item accept-btn" style={{ flex: 2, justifyContent: 'center' }} onClick={handleAccept}>
                Accept & Insert
              </button>
              <button className="menu-item" style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--border-color)' }} onClick={triggerGeneration}>
                Regenerate
              </button>
              <button className="menu-item" style={{ flex: 1, justifyContent: 'center', color: 'var(--error)' }} onClick={() => { setGenerationPreview(''); setMode('idle'); }}>
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

        {/* Floating Command Hint */}
        {!isProcessing && !generationPreview && <CommandHint isProcessing={false} />}
      </div>
    </div>
  );
};

const headerStyles = {
  stats: {
    display: 'flex',
    gap: '12px',
    marginRight: '20px',
  },
  badge: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'rgba(0,0,0,0.04)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
  },
  processing: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--primary-color)',
    marginRight: '20px',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-sans)',
  }
};
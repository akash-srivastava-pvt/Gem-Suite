import React, { useState } from 'react';
import { SelectionState } from '../hooks/useSelection.js';
import { textEditorService } from '../services/textEditorService.js';
import { TextEditorIntent } from '@gem/shared';

interface SelectionMenuProps {
  selection: SelectionState;
  onConfirm: (newText: string) => void;
  onClose: () => void;
}

const LANGUAGES = [
  { label: '🇮🇳 Hindi', value: 'hindi' },
  { label: '🇪🇸 Spanish', value: 'spanish' },
  { label: '🇫🇷 French', value: 'french' },
  { label: '🇩🇪 German', value: 'german' },
  { label: '🇯🇵 Japanese', value: 'japanese' }
];

export const SelectionMenu: React.FC<SelectionMenuProps> = ({ selection, onConfirm, onClose }) => {
  const [view, setView] = useState<'main' | 'languages' | 'preview'>('main');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (intent: TextEditorIntent, language?: string) => {
    setLoading(true);
    setView('preview');
    try {
      const result = await textEditorService.query({
        intent,
        text: selection.text,
        language,
      });
      setPreview(result);
    } catch (err) {
      alert("AI failed to process selection.");
      setView('main');
    } finally {
      setLoading(false);
    }
  };

  // Position based on selection rect or default to a readable spot
  const menuStyle: React.CSSProperties = {
    top: selection.rect ? `${selection.rect.top + 20}px` : '100px',
    left: selection.rect ? `${selection.rect.left}px` : '50%',
    transform: selection.rect ? 'none' : 'translateX(-50%)',
  };

  return (
    <div className="selection-menu" style={menuStyle}>
      {/* 1. Main Options View */}
      {view === 'main' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI Assistant
          </div>
          <button className="menu-item" onClick={() => handleAction('rewrite')}>✍️ Rewrite selection</button>
          <button className="menu-item" onClick={() => handleAction('grammar')}>🪄 Fix grammar & spelling</button>
          <button className="menu-item" onClick={() => setView('languages')}>🌐 Translate to...</button>
          <button className="menu-item" onClick={() => handleAction('summarize')}>📋 Summarize text</button>
          <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />
          <button className="menu-item" style={{ color: '#ff4d4f' }} onClick={onClose}>Discard</button>
        </div>
      )}

      {/* 2. Language Picker View */}
      {view === 'languages' && (
        <>
          <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>
            Select Language
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                className="menu-item"
                onClick={() => handleAction('translate', lang.value)}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button className="menu-item" style={{ borderTop: '1px solid #eee', marginTop: '4px', justifyContent: 'center' }} onClick={() => setView('main')}>
            ← Back
          </button>
        </>
      )}

      {/* 3. AI Result Preview View */}
      {view === 'preview' && (
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
            AI Suggestion
          </div>
          <div className="preview-overlay" style={{ fontSize: '14px', marginBottom: '16px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <span className="spinning-loader" /> Thinking...
              </div>
            ) : preview}
          </div>
          {!loading && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="menu-item accept-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onConfirm(preview)}
              >
                Replace Text
              </button>
              <button
                className="menu-item"
                style={{ flex: 1, justifyContent: 'center', border: '1px solid #eee' }}
                onClick={() => setView('main')}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
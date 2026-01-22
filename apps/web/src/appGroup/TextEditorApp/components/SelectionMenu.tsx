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

  return (
    <div className="selection-menu">
      {/* 1. Main Options View */}
      {view === 'main' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={styles.menuHeader}>
            AI WRITE ASSIST
          </div>
          <button className="menu-item" onClick={() => handleAction('rewrite')}>
            <span style={{ fontSize: '18px' }}>✍️</span> Rewrite Selection
          </button>
          <button className="menu-item" onClick={() => handleAction('grammar')}>
            <span style={{ fontSize: '18px' }}>🪄</span> Fix Grammar & Style
          </button>
          <button className="menu-item" onClick={() => setView('languages')}>
            <span style={{ fontSize: '18px' }}>🌐</span> Translate Content...
          </button>
          <button className="menu-item" onClick={() => handleAction('summarize')}>
            <span style={{ fontSize: '18px' }}>📋</span> Summarize
          </button>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 4px' }} />
          <button className="menu-item" style={{ color: 'var(--error)' }} onClick={onClose}>
            <span style={{ fontSize: '18px' }}>✕</span> Close Menu
          </button>
        </div>
      )}

      {/* 2. Language Picker View */}
      {view === 'languages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={styles.menuHeader}>
            SELECT TARGET LANGUAGE
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
          <button className="menu-item" style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', justifyContent: 'center', opacity: 0.8 }} onClick={() => setView('main')}>
            ← Back to Actions
          </button>
        </div>
      )}

      {/* 3. AI Result Preview View */}
      {view === 'preview' && (
        <div style={{ padding: '8px' }}>
          <div style={styles.menuHeader}>
            AI SUGGESTION
          </div>
          <div className="preview-overlay" style={{ fontSize: '15px', marginBottom: '16px', maxHeight: '200px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-secondary-color)', padding: '10px' }}>
                <span className="spinning-loader" /> AI is drafting...
              </div>
            ) : preview}
          </div>
          {!loading && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="menu-item accept-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onConfirm(preview)}
              >
                Insert
              </button>
              <button
                className="menu-item"
                style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--border-color)' }}
                onClick={() => setView('main')}
              >
                Discard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  menuHeader: {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 800,
    color: 'var(--text-secondary-color)',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    opacity: 0.9,
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '8px',
  }
};

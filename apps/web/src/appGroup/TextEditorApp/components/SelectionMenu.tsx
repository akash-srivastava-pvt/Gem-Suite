import React, { useState } from 'react';
import { SelectionState } from '../hooks/useSelection.js';
import { textEditorService} from '../services/textEditorService.js';
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
        language, // Passed to backend for 'translate' intent
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
    <div className="selection-menu" style={{ top: '20%', left: '40%' }}>
      {/* 1. Main Options View */}
      {view === 'main' && (
        <>
          <button className="menu-item" onClick={() => handleAction('rewrite')}>✍️ Rewrite</button>
          <button className="menu-item" onClick={() => handleAction('grammar')}>🪄 Fix Grammar</button>
          <button className="menu-item" onClick={() => setView('languages')}>🌐 Translate →</button>
          <button className="menu-item" onClick={() => handleAction('summarize')}>📋 Summarize</button>
          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '4px 0' }} />
          <button className="menu-item" style={{ color: '#ff4d4f' }} onClick={onClose}>Cancel</button>
        </>
      )}

      {/* 2. Language Picker View */}
      {view === 'languages' && (
        <>
          <div style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>
            Select Language
          </div>
          {LANGUAGES.map((lang) => (
            <button 
              key={lang.value} 
              className="menu-item" 
              onClick={() => handleAction('translate', lang.value)}
            >
              {lang.label}
            </button>
          ))}
          <button className="menu-item" style={{ borderTop: '1px solid #eee' }} onClick={() => setView('main')}>
            ← Back
          </button>
        </>
      )}

      {/* 3. AI Result Preview View */}
      {view === 'preview' && (
        <div style={{ padding: '8px' }}>
          <div className="preview-overlay">
            {loading ? 'AI is translating...' : preview}
          </div>
          {!loading && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button 
                className="menu-item" 
                style={{ background: 'var(--accent-color)', color: 'white', flex: 1, textAlign: 'center' }} 
                onClick={() => onConfirm(preview)}
              >
                Replace
              </button>
              <button className="menu-item" style={{ flex: 1, textAlign: 'center' }} onClick={() => setView('main')}>
                Discard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
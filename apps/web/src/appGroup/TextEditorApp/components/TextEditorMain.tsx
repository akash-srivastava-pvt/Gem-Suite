import React, { useState } from 'react';
import { TiptapEditor } from './TiptapEditor.js';
import { useShell } from '../../../context/ShellContext.js';
import { SaveControls } from '../../../components/SaveControls.js';
import { SavedArtifact } from '@gem/shared';
import { exportToPdf, exportToDocx, importFromDocx } from '../utils/fileUtils.js';
import { FileUp, FileDown, FileText } from 'lucide-react';

export const TextEditorMain: React.FC = () => {
  const { setHeaderActions } = useShell();
  const [content, setContent] = useState<string>('<h1>Welcome to Gem Likhit</h1><p>Start writing your professional document with AI assistance.</p>');

  const handleDataLoaded = (artifact: SavedArtifact) => {
    setContent(artifact.data);
  };

  const handleCreateNew = () => {
    setContent('<h1>Untitled Document</h1><p></p>');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        const html = await importFromDocx(file);
        setContent(html);
      } else if (file.name.endsWith('.gemdoc') || file.name.endsWith('.json')) {
        const text = await file.text();
        try {
          const json = JSON.parse(text);
          setContent(json);
        } catch {
          setContent(text);
        }
      } else {
        const text = await file.text();
        setContent(text);
      }
    }
  };

  // Sync with Shell Header
  React.useEffect(() => {
    setHeaderActions(
      <div style={headerStyles.container}>
        <div className="toolbar-group" style={{ borderRight: 'none' }}>
          <label className="toolbar-btn" title="Import Document" style={{ cursor: 'pointer' }}>
            <FileUp size={18} />
            <input type="file" hidden onChange={handleFileUpload} accept=".docx,.txt,.gemdoc" />
          </label>
        </div>

        <SaveControls
          appName="likhit"
          currentData={content}
          dataType="text"
          onDataLoaded={handleDataLoaded}
          onCreateNew={handleCreateNew}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="secondary-btn"
            onClick={() => exportToPdf(document.querySelector('.ProseMirror') as HTMLElement)}
            style={headerStyles.actionBtn}
          >
            <FileText size={16} /> PDF
          </button>
          <button
            className="secondary-btn"
            onClick={() => exportToDocx(document.querySelector('.ProseMirror')?.innerHTML || '')}
            style={headerStyles.actionBtn}
          >
            <FileDown size={16} /> DOCX
          </button>
        </div>
      </div>
    );
    return () => setHeaderActions(null);
  }, [content]);

  return (
    <div className="likhit-app-container">
      <TiptapEditor
        initialContent={content}
        onUpdate={setContent}
      />
    </div>
  );
};

const headerStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginRight: '12px',
  },
  actionBtn: {
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    padding: '0 12px',
    borderRadius: '8px',
  }
};
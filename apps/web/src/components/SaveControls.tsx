import React, { useState } from 'react';
import { SavedItemsList } from './SavedItemsList.js';
import { SavedArtifact, SaveArtifactRequest } from '@gem/shared';
import { persistenceService } from '../services/persistenceService.js';

interface SaveControlsProps {
  appName: string;
  currentData: string;
  dataType: 'text' | 'json' | 'image' | 'trip' | 'resume' | 'invitation';
  onDataLoaded: (artifact: SavedArtifact) => void;
  onCreateNew: () => void;
  metadata?: Record<string, any>;
  className?: string;
}

export const SaveControls: React.FC<SaveControlsProps> = ({
  appName,
  currentData,
  dataType,
  onDataLoaded,
  onCreateNew,
  metadata,
  className = ''
}) => {
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    if (!currentData.trim()) {
      setSaveError('No data to save');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const filename = persistenceService.generateFilename(
        `${appName}_${dataType}`,
        dataType === 'image' ? 'png' : 'json'
      );

      const request: SaveArtifactRequest = {
        appName,
        filename,
        data: currentData,
        dataType,
        metadata
      };

      await persistenceService.saveArtifact(request);

      setSaveSuccess(`Saved as "${filename}"`);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);

    } catch (err: any) {
      setSaveError(err.message || 'Failed to save');
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenItem = (artifact: SavedArtifact) => {
    onDataLoaded(artifact);
    setShowSavedItems(false);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setShowSavedItems(false);
  };

  return (
    <div className={`save-controls ${className}`}>
      <div className="controls-bar">
        <button
          className="primary-btn"
          onClick={handleSave}
          disabled={saving || !currentData.trim()}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          className="secondary-btn"
          onClick={onCreateNew}
          disabled={saving}
        >
          Create New
        </button>

        <button
          className="secondary-btn"
          onClick={() => setShowSavedItems(!showSavedItems)}
          disabled={saving}
        >
          {showSavedItems ? 'Hide Saved Items' : 'Saved Items'}
        </button>

        <button
          className="secondary-btn"
          onClick={handleCreateNew}
        >
          Create New
        </button>
      </div>

      {saveError && (
        <div className="message error">
          {saveError}
          <button onClick={() => setSaveError(null)}>×</button>
        </div>
      )}

      {saveSuccess && (
        <div className="message success">
          {saveSuccess}
          <button onClick={() => setSaveSuccess(null)}>×</button>
        </div>
      )}

      {showSavedItems && (
        <>
          <div className="modal-overlay" onClick={() => setShowSavedItems(false)} />
          <div className="saved-items-modal">
            <SavedItemsList
              appName={appName}
              onOpenItem={handleOpenItem}
              onCreateNew={handleCreateNew}
              onClose={() => setShowSavedItems(false)}
            />
          </div>
        </>
      )}
    </div>
  );
};

// CSS styles
const styles = `
.save-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  min-height: 40px;
}

.primary-btn {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-btn {
  background: var(--surface);
  color: var(--text-primary);
  border-color: var(--border);
}

.secondary-btn:hover:not(:disabled) {
  background: var(--background);
  border-color: var(--primary);
}

.message {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success, #16a34a);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.message button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  margin-left: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.saved-items-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  animation: modalSlideIn 0.3s ease-out;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

import React, { useState, useEffect } from 'react';
import { SavedArtifact } from '@gem/shared';
import { persistenceService } from '../services/persistenceService.js';

interface SavedItemsListProps {
  appName: string;
  onOpenItem: (artifact: SavedArtifact) => void;
  onCreateNew?: () => void;
  onClose?: () => void;
  className?: string;
}

export const SavedItemsList: React.FC<SavedItemsListProps> = ({
  appName,
  onOpenItem,
  onCreateNew,
  onClose,
  className = ''
}) => {
  const [artifacts, setArtifacts] = useState<SavedArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SavedArtifact | null>(null);

  const loadArtifacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await persistenceService.getArtifacts(appName);
      setArtifacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved items');
      console.error('Failed to load artifacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtifacts();
  }, [appName]);

  const handleDeleteClick = (artifact: SavedArtifact) => {
    setConfirmDelete(artifact);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      setDeletingId(confirmDelete.id);
      setConfirmDelete(null); // Close confirmation dialog

      const success = await persistenceService.deleteArtifact(appName, confirmDelete.filename);

      if (success) {
        setArtifacts(prev => {
          const newArtifacts = prev.filter(a => a.id !== confirmDelete.id);
          console.log('Artifacts after delete:', newArtifacts.length, 'items');
          return newArtifacts;
        });
      } else {
        setError('Failed to delete item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      console.error('Failed to delete artifact:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleOpen = (artifact: SavedArtifact) => {
    onOpenItem(artifact);
    onClose?.();
  };

  if (loading) {
    return (
      <div className={`saved-items-list ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading saved items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`saved-items-list ${className}`}>
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="secondary-btn" onClick={loadArtifacts}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`saved-items-list ${className}`} style={{ maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="list-header">
        <h3>Saved Items</h3>
        <div className="header-actions">
          {onCreateNew && (
            <button className="secondary-btn" onClick={() => { onCreateNew(); onClose?.(); }}>
              Create New
            </button>
          )}
          <button className="close-btn" onClick={onClose} title="Close">
            ×
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {artifacts.length === 0 ? (
          <div className="empty-state">
            <p>No saved items yet.</p>
            <p className="empty-subtitle">Use the "Create New" button above to get started!</p>
          </div>
        ) : (
          <div className="items-grid" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
          {artifacts.map(artifact => (
            <div key={artifact.id} className="item-card">
              <div className="item-info">
                <div className="item-header">
                  <h4 className="item-filename">{artifact.filename}</h4>
                  <span className="item-type">
                    {persistenceService.getDataTypeDisplayName(artifact.dataType)}
                  </span>
                </div>

                <div className="item-meta">
                  <span className="item-date">
                    {persistenceService.formatDate(artifact.updatedAt)}
                  </span>
                  {artifact.dataType === 'text' && (
                    <span className="item-size">
                      {persistenceService.formatFileSize(new Blob([artifact.data]).size)}
                    </span>
                  )}
                  {artifact.dataType === 'image' && artifact.data.startsWith('data:image') && (
                    <span className="item-preview">
                      <img
                        src={artifact.data}
                        alt="Preview"
                        className="thumbnail"
                      />
                    </span>
                  )}
                </div>

                {artifact.metadata && (
                  <div className="item-metadata">
                    {Object.entries(artifact.metadata).map(([key, value]) => (
                      <span key={key} className="meta-tag">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="item-actions">
                <button
                  className="primary-btn small"
                  onClick={() => handleOpen(artifact)}
                  title="Open & Edit"
                >
                  Open & Edit
                </button>

                <button
                  className="danger-btn small"
                  onClick={() => handleDeleteClick(artifact)}
                  disabled={deletingId === artifact.id}
                  title="Delete"
                >
                  {deletingId === artifact.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>"{confirmDelete.filename}"</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button
                className="secondary-btn"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="danger-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles (inline for simplicity, can be moved to separate CSS file)
const styles = `
.saved-items-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: var(--hover-overlay);
  color: var(--text-primary);
}

.list-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 24px;
  color: var(--text-secondary);
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: var(--error);
  margin: 0;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

.item-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--primary-hover));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.item-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-card:hover::before {
  transform: scaleX(1);
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.item-filename {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  word-break: break-word;
  flex: 1;
  line-height: 1.3;
}

.item-type {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 12px;
  border-radius: var(--radius-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.item-date {
  font-size: 0.75rem;
}

.item-size {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.thumbnail {
  max-width: 60px;
  max-height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-top: 4px;
}

.item-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.meta-tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--background);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.item-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light, rgba(0,0,0,0.08));
}

.primary-btn,
.secondary-btn,
.danger-btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.primary-btn {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.secondary-btn {
  background: var(--surface);
  color: var(--text-primary);
  border-color: var(--border);
}

.secondary-btn:hover:not(:disabled) {
  background: var(--background);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.danger-btn {
  background: var(--error);
  color: white;
  border-color: var(--error);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.danger-btn:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.primary-btn:disabled,
.secondary-btn:disabled,
.danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.primary-btn.small,
.secondary-btn.small,
.danger-btn.small {
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
}

.empty-state .empty-subtitle {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  font-style: italic;
}

/* Confirmation Dialog Styles */
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.confirmation-dialog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  position: relative;
}

.confirmation-dialog h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

.confirmation-dialog p {
  margin: 0 0 16px 0;
  color: var(--text-secondary);
  line-height: 1.6;
  text-align: center;
}

.confirmation-dialog .warning-text {
  color: var(--error);
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.confirmation-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.confirmation-actions button {
  min-width: 100px;
  padding: 12px 24px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.confirmation-actions .secondary-btn {
  border: 2px solid var(--border);
  background: transparent;
}

.confirmation-actions .secondary-btn:hover {
  background: var(--background);
  border-color: var(--text-secondary);
}

.confirmation-actions .danger-btn {
  background: var(--error);
  border: 2px solid var(--error);
  color: white;
}

.confirmation-actions .danger-btn:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

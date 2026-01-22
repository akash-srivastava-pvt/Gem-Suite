import React, { useState, useEffect, useRef } from 'react';
import { apiManagerService } from '../../services/apiManagerService.js';
import { AI_PROVIDERS, UserApiKey, ProviderConfig } from '@gem/shared';

interface ApiManagerProps {
  onApiKeyAdded?: () => void;
}

export const ApiManager: React.FC<ApiManagerProps> = ({ onApiKeyAdded }) => {
  const [apiKeys, setApiKeys] = useState<UserApiKey[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    tier: '',
    apiKey: '',
    selectedTextModel: '',
    selectedImageModel: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch providers first as they are critical for the form
      try {
        const providersRes = await apiManagerService.getProviders();
        setProviders(providersRes.data || AI_PROVIDERS);
      } catch (pError) {
        console.error('Failed to fetch providers, using defaults:', pError);
        setProviders(AI_PROVIDERS);
      }

      // Then fetch keys
      try {
        const keysRes = await apiManagerService.getApiKeys();
        setApiKeys(keysRes.data || []);
      } catch (kError) {
        console.error('Failed to fetch API keys:', kError);
        setApiKeys([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiManagerService.createApiKey(formData);
      setShowForm(false);
      setFormData({ provider: '', tier: '', apiKey: '', selectedTextModel: '', selectedImageModel: '' });

      if (onApiKeyAdded) {
        onApiKeyAdded();
      } else {
        await fetchData();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save API key');
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await apiManagerService.setDefault(id);
      if (onApiKeyAdded) {
        onApiKeyAdded();
      } else {
        await fetchData();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to set default');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await apiManagerService.toggleActive(id);
      if (onApiKeyAdded) {
        onApiKeyAdded();
      } else {
        await fetchData();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to toggle status');
    }
  };

  const handleUpdateModels = async (id: number, textModel: string, imageModel: string) => {
    try {
      await apiManagerService.updateModels(id, { selectedTextModel: textModel, selectedImageModel: imageModel });
      await fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to update models');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    setIsDeleting(true);
    try {
      await apiManagerService.deleteApiKey(id);
      if (onApiKeyAdded) {
        onApiKeyAdded();
      } else {
        await fetchData();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete API key');
    } finally {
      if (mounted.current) setIsDeleting(false);
    }
  };

  const isBusy = submitting || isDeleting;

  const selectedProvider = providers.find(p => p.providerId === formData.provider);
  const selectedTier = selectedProvider?.tiers.find(t => t.tierId === formData.tier);
  const textModels = selectedTier?.models.filter(m => m.modality === 'text') || [];
  const imageModels = selectedTier?.models.filter(m => m.modality === 'image') || [];

  if (loading) return <div style={styles.loading}>Loading API Manager...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>API Key Management</h2>
        <button
          className="primary-btn"
          onClick={() => {
            if (!showForm) {
              setFormData({ provider: '', tier: '', apiKey: '', selectedTextModel: '', selectedImageModel: '' });
              setError(null);
            }
            setShowForm(!showForm);
          }}
          style={styles.addButton}
          disabled={isBusy}
        >
          {showForm ? 'Cancel' : '+ Add API Key'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.formGroup}>
              <label>Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => {
                  setFormData({ ...formData, provider: e.target.value, tier: '', selectedTextModel: '', selectedImageModel: '' });
                  setError(null);
                }}
                required
                disabled={isBusy}
              >
                <option value="">Select Provider</option>
                {providers.map(p => (
                  <option key={p.providerId} value={p.providerId}>{p.displayName}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value, selectedTextModel: '', selectedImageModel: '' })}
                required
                disabled={!formData.provider || isBusy}
              >
                <option value="">Select Tier</option>
                {selectedProvider?.tiers.map(t => (
                  <option key={t.tierId} value={t.tierId}>{t.displayName}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => {
                  setFormData({ ...formData, apiKey: e.target.value });
                  setError(null);
                }}
                placeholder="Enter your API key"
                required
                disabled={isBusy}
              />
            </div>

            {textModels.length > 0 && (
              <div style={styles.formGroup}>
                <label>Text Model</label>
                <select
                  value={formData.selectedTextModel}
                  onChange={(e) => setFormData({ ...formData, selectedTextModel: e.target.value })}
                  disabled={isBusy}
                >
                  <option value="">Select Text Model</option>
                  {textModels.map(m => (
                    <option key={m.modelId} value={m.modelId}>{m.modelId}</option>
                  ))}
                </select>
              </div>
            )}

            {imageModels.length > 0 && (
              <div style={styles.formGroup}>
                <label>Image Model</label>
                <select
                  value={formData.selectedImageModel}
                  onChange={(e) => setFormData({ ...formData, selectedImageModel: e.target.value })}
                  disabled={isBusy}
                >
                  <option value="">Select Image Model</option>
                  {imageModels.map(m => (
                    <option key={m.modelId} value={m.modelId}>{m.modelId}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="primary-btn" disabled={isBusy}>
            {submitting ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      )}

      <div style={styles.keysList}>
        {apiKeys.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No API keys configured. Add your first API key to unlock all GEM applications.</p>
            {!showForm && (
              <button
                className="primary-btn"
                onClick={() => {
                  setFormData({ provider: '', tier: '', apiKey: '', selectedTextModel: '', selectedImageModel: '' });
                  setError(null);
                  setShowForm(true);
                }}
                style={{ marginTop: '16px' }}
                disabled={isBusy}
              >
                + Add Now
              </button>
            )}
          </div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Provider</span>
              <span>Tier</span>
              <span>Status</span>
              <span>Default</span>
              <span>Text Model</span>
              <span>Image Model</span>
              <span>Actions</span>
            </div>
            {apiKeys.map(key => {
              const keyProvider = providers.find(p => p.providerId === key.provider);
              const keyTier = keyProvider?.tiers.find(t => t.tierId === key.tier);
              const keyTextModels = keyTier?.models.filter(m => m.modality === 'text') || [];
              const keyImageModels = keyTier?.models.filter(m => m.modality === 'image') || [];

              return (
                <div key={key.id} style={styles.tableRow}>
                  <span>{key.provider}</span>
                  <span>{key.tier}</span>
                  <span style={{ color: key.isActive ? 'var(--success)' : 'var(--error)' }}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span>{key.isDefault ? '✓ Default' : ''}</span>
                  <select
                    value={key.selectedTextModel || ''}
                    onChange={(e) => handleUpdateModels(key.id, e.target.value, key.selectedImageModel || '')}
                    style={styles.modelSelect}
                  >
                    <option value="">Select Text Model</option>
                    {keyTextModels.map(m => (
                      <option key={m.modelId} value={m.modelId}>{m.modelId}</option>
                    ))}
                  </select>
                  <select
                    value={key.selectedImageModel || ''}
                    onChange={(e) => handleUpdateModels(key.id, key.selectedTextModel || '', e.target.value)}
                    style={styles.modelSelect}
                    disabled={isBusy}
                  >
                    <option value="">Select Image Model</option>
                    {keyImageModels.map(m => (
                      <option key={m.modelId} value={m.modelId}>{m.modelId}</option>
                    ))}
                  </select>
                  <div style={styles.actions}>
                    {!key.isDefault && (
                      <button
                        className="secondary-btn"
                        onClick={() => handleSetDefault(key.id)}
                        style={styles.actionBtn}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      className="secondary-btn"
                      onClick={() => handleToggleActive(key.id)}
                      style={styles.actionBtn}
                    >
                      {key.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => handleDelete(key.id)}
                      style={{ ...styles.actionBtn, color: 'var(--error)' }}
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
  },
  loading: {
    padding: '40px',
    textAlign: 'center' as const,
    color: 'var(--text-secondary)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  addButton: {
    fontSize: '0.9rem'
  },
  form: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    marginBottom: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  keysList: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center' as const,
    color: 'var(--text-secondary)'
  },
  table: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr 1.5fr 2fr',
    gap: '16px',
    padding: '16px',
    background: 'var(--background)',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr 1.5fr 2fr',
    gap: '16px',
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    alignItems: 'center'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const
  },
  actionBtn: {
    fontSize: '0.75rem',
    padding: '4px 8px'
  },
  modelSelect: {
    fontSize: '0.75rem',
    padding: '4px 8px',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    background: 'var(--surface)'
  },
  error: {
    gridColumn: '1 / -1',
    color: 'var(--error)',
    marginBottom: '8px',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem'
  }
};
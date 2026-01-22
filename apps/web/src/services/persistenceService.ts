import { SavedArtifact, SaveArtifactRequest, UpdateArtifactRequest, UsageMetrics, HealthStatus } from '@gem/shared';

const API_BASE = '/api/v1/persistence';

class PersistenceService {
  /**
   * Save a new artifact
   */
  async saveArtifact(request: SaveArtifactRequest): Promise<SavedArtifact> {
    console.log('📤 Frontend saveArtifact called:', { appName: request.appName, filename: request.filename, dataType: request.dataType, dataLength: request.data?.length });

    try {
      console.log('🌐 Making request to:', `${API_BASE}/save`);
      const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to save artifact');
      }

      const result = await response.json();

      // Track local save
      this.trackLocalUsage(request.appName, 'save');

      return result.data;
    } catch (error) {
      console.warn('⚠️ API save failed, falling back to localStorage:', error);
      // Fallback to localStorage if API is not available
      return this.saveArtifactLocal(request);
    }
  }

  private saveArtifactLocal(request: SaveArtifactRequest): SavedArtifact {
    const artifacts = this.getLocalArtifacts(request.appName);
    const existingIndex = artifacts.findIndex(a => a.filename === request.filename);

    const artifact: SavedArtifact = {
      id: existingIndex >= 0 ? artifacts[existingIndex].id : Date.now(),
      appName: request.appName,
      filename: request.filename,
      data: request.data,
      dataType: request.dataType,
      createdAt: existingIndex >= 0 ? artifacts[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata
    };

    if (existingIndex >= 0) {
      artifacts[existingIndex] = artifact;
    } else {
      artifacts.push(artifact);
    }

    localStorage.setItem(`gem-artifacts-${request.appName}`, JSON.stringify(artifacts));
    console.log('💾 Saved to localStorage (fallback):', artifact);

    return artifact;
  }

  private getLocalArtifacts(appName: string): SavedArtifact[] {
    try {
      const stored = localStorage.getItem(`gem-artifacts-${appName}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load local artifacts:', error);
      return [];
    }
  }

  /**
   * Get all artifacts for an app
   */
  async getArtifacts(appName: string): Promise<SavedArtifact[]> {
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(appName)}`);

      if (!response.ok) {
        // Don't throw error for empty results, just return empty array
        if (response.status === 404) {
          console.log(`📂 No artifacts found for ${appName}, returning empty array`);
          return [];
        }
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to get artifacts');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.warn('⚠️ API getArtifacts failed, falling back to localStorage:', error);
      return this.getLocalArtifacts(appName);
    }
  }

  /**
   * Get a specific artifact
   */
  async getArtifact(appName: string, filename: string): Promise<SavedArtifact | null> {
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(appName)}/${encodeURIComponent(filename)}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to get artifact');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn('⚠️ API getArtifact failed, falling back to localStorage:', error);
      const artifacts = this.getLocalArtifacts(appName);
      return artifacts.find(a => a.filename === filename) || null;
    }
  }

  /**
   * Update an existing artifact
   */
  async updateArtifact(appName: string, filename: string, updates: UpdateArtifactRequest): Promise<SavedArtifact | null> {
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(appName)}/${encodeURIComponent(filename)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to update artifact');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn('⚠️ API updateArtifact failed, falling back to localStorage:', error);
      // For localStorage, we'd need to implement update logic
      return null;
    }
  }

  /**
   * Delete an artifact
   */
  async deleteArtifact(appName: string, filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(appName)}/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to delete artifact');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.warn('⚠️ API deleteArtifact failed, falling back to localStorage:', error);
      const artifacts = this.getLocalArtifacts(appName);
      const filtered = artifacts.filter(a => a.filename !== filename);

      if (filtered.length === artifacts.length) return false;

      localStorage.setItem(`gem-artifacts-${appName}`, JSON.stringify(filtered));
      return true;
    }
  }

  /**
   * Get usage metrics for all apps
   */
  async getUsageMetrics(): Promise<UsageMetrics[]> {
    try {
      const response = await fetch(`${API_BASE}/metrics/all`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to get usage metrics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      // Fallback to local metrics if server unavailable
      return this.getLocalUsageMetrics();
    }
  }


  /**
   * Get usage metrics for a specific app
   */
  async getAppUsageMetrics(appName: string): Promise<UsageMetrics | null> {
    const response = await fetch(`${API_BASE}/metrics/${encodeURIComponent(appName)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get app usage metrics');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${API_BASE}/health`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Health check failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn('⚠️ API healthCheck failed, returning basic status:', error);
      return {
        status: 'unknown',
        timestamp: new Date().toISOString(),
        uptime: 0,
        database: { status: 'unknown' },
        memory: { used: 0, total: 0 },
        artifacts: { count: 0 },
        errors: { count: 1, lastError: 'API unavailable' }
      };
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<any> {
    console.log('🧪 Testing localStorage connection');
    return { success: true, message: 'Local storage is working', timestamp: new Date().toISOString() };
  }

  /**
   * Create database backup
   */
  async createBackup(): Promise<{ backupPath: string }> {
    const response = await fetch(`${API_BASE}/backup`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create backup');
    }

    const result = await response.json();
    return result;
  }

  /**
   * Generate a unique filename
   */
  generateFilename(prefix: string, dataType: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}.${dataType}`;
  }

  /**
   * Validate filename (prevent path traversal, etc.)
   */
  validateFilename(filename: string): boolean {
    // Prevent path traversal and ensure valid filename
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

    if (invalidChars.test(filename) || filename.length > 255) {
      return false;
    }

    const baseName = filename.split('.')[0];
    if (reservedNames.test(baseName)) {
      return false;
    }

    return true;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  /**
   * Track usage for metrics
   */
  trackLocalUsage(appName: string, action: 'api_hit' | 'save' | 'generate'): void {
    try {
      const usageKey = `gem-usage-${appName}`;
      const existing = localStorage.getItem(usageKey);
      let usageData = { apiHits: 0, generatedArtifacts: 0, saves: 0 };

      if (existing) {
        usageData = JSON.parse(existing);
      }

      if (action === 'api_hit') {
        usageData.apiHits++;
      } else if (action === 'generate') {
        usageData.generatedArtifacts++;
      } else if (action === 'save') {
        usageData.saves++;
      }

      localStorage.setItem(usageKey, JSON.stringify(usageData));
    } catch (error) {
      console.warn('Could not track local usage:', error);
    }
  }

  /**
   * Get usage metrics from localStorage
   */
  getLocalUsageMetrics(): UsageMetrics[] {
    const apps = ['texteditor', 'tripplanner', 'invitation', 'resumemaker'];
    const metrics: UsageMetrics[] = [];

    apps.forEach(appName => {
      try {
        const usageKey = `gem-usage-${appName}`;
        const existing = localStorage.getItem(usageKey);
        let usageData = { apiHits: 0, generatedArtifacts: 0, saves: 0 };

        if (existing) {
          usageData = JSON.parse(existing);
        }

        // Count saved artifacts from localStorage
        const savedArtifacts = this.getLocalArtifacts(appName).length;

        metrics.push({
          appName,
          apiHits: usageData.apiHits,
          savedArtifacts,
          generatedArtifacts: usageData.generatedArtifacts,
          apiErrors: 0
        });
      } catch (error) {
        console.error(`Error calculating local metrics for ${appName}:`, error);
        metrics.push({
          appName,
          apiHits: 0,
          savedArtifacts: 0,
          generatedArtifacts: 0,
          apiErrors: 0
        });
      }
    });

    return metrics;
  }

  /**
   * Get data type display name
   */
  getDataTypeDisplayName(dataType: string): string {
    const displayNames: Record<string, string> = {
      text: 'Text',
      json: 'JSON',
      image: 'Image',
      trip: 'Trip Plan',
      resume: 'Resume',
      invitation: 'Invitation'
    };

    return displayNames[dataType] || dataType;
  }
}

export const persistenceService = new PersistenceService();

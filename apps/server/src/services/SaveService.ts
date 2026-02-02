import { db } from '@gem/db';
import { SavedArtifact, SaveArtifactRequest, UpdateArtifactRequest, DataType, UsageMetrics } from '@gem/shared';
import { LoggerModel } from '../models/loggerModel.js';
import { AuditLogService } from './AuditLogService.js';

export class SaveService {
  /**
   * Save a new artifact
   */
  async saveArtifact(request: SaveArtifactRequest): Promise<SavedArtifact> {
    try {
      console.log('💾 SaveService.saveArtifact called:', { appName: request.appName, filename: request.filename, dataType: request.dataType, dataLength: request.data?.length });
      const { appName, filename, data, dataType, metadata } = request;

      // Validate inputs
      if (!appName || !filename || !data || !dataType) {
        throw new Error('Missing required fields: appName, filename, data, dataType');
      }

      if (!['text', 'json', 'image', 'trip', 'resume', 'invitation'].includes(dataType)) {
        throw new Error('Invalid dataType. Must be one of: text, json, image, trip, resume, invitation');
      }

      const metadataJson = metadata ? JSON.stringify(metadata) : null;
      const now = new Date().toISOString();

      // Use a transaction for atomicity
      const result = db.execute(
        `INSERT OR REPLACE INTO saved_artifacts
         (app_name, filename, data, data_type, created_at, updated_at, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [appName, filename, data, dataType, now, now, metadataJson]
      ) as any;

      // Log the save event
      await this.trackUsage(appName, 'save', { filename, dataType });

      AuditLogService.log(`Generated file saved: ${filename}`, appName, false, "SUCCESS");

      return {
        id: result.insertId as number,
        appName,
        filename,
        data,
        dataType,
        createdAt: now,
        updatedAt: now,
        metadata
      };
    } catch (error: any) {
      console.error('SaveService.saveArtifact error:', error);
      AuditLogService.log(`Save Artifact Error: ${error.message}`, request.appName, false, "FAILED", { filename: request.filename });
      throw new Error(`Failed to save artifact: ${error.message}`);
    }
  }

  /**
   * Get all artifacts for an app
   */
  async getArtifacts(appName: string): Promise<SavedArtifact[]> {
    try {
      if (!appName) {
        throw new Error('appName is required');
      }

      const rows = db.query(
        `SELECT id, app_name, filename, data, data_type, created_at, updated_at, metadata
         FROM saved_artifacts
         WHERE app_name = ?
         ORDER BY updated_at DESC`,
        [appName]
      );

      return rows.map((row: any) => ({
        id: row.id as number,
        appName: row.app_name as string,
        filename: row.filename as string,
        data: row.data as string,
        dataType: row.data_type as DataType,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
      }));
    } catch (error: any) {
      console.error('SaveService.getArtifacts error:', error);
      throw new Error(`Failed to get artifacts: ${error.message}`);
    }
  }

  /**
   * Get a specific artifact
   */
  async getArtifact(appName: string, filename: string): Promise<SavedArtifact | null> {
    try {
      if (!appName || !filename) {
        throw new Error('appName and filename are required');
      }

      const rows = db.query(
        `SELECT id, app_name, filename, data, data_type, created_at, updated_at, metadata
         FROM saved_artifacts
         WHERE app_name = ? AND filename = ?`,
        [appName, filename]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0] as any;
      return {
        id: row.id as number,
        appName: row.app_name as string,
        filename: row.filename as string,
        data: row.data as string,
        dataType: row.data_type as DataType,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
      };
    } catch (error: any) {
      console.error('SaveService.getArtifact error:', error);
      throw new Error(`Failed to get artifact: ${error.message}`);
    }
  }

  /**
   * Update an existing artifact
   */
  async updateArtifact(appName: string, filename: string, updates: UpdateArtifactRequest): Promise<SavedArtifact | null> {
    try {
      if (!appName || !filename) {
        throw new Error('appName and filename are required');
      }

      // Check if artifact exists
      const existing = await this.getArtifact(appName, filename);
      if (!existing) {
        return null;
      }

      const now = new Date().toISOString();
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.filename && updates.filename !== filename) {
        updateFields.push('filename = ?');
        updateValues.push(updates.filename);
      }

      if (updates.data !== undefined) {
        updateFields.push('data = ?');
        updateValues.push(updates.data);
      }

      if (updates.metadata !== undefined) {
        updateFields.push('metadata = ?');
        updateValues.push(JSON.stringify(updates.metadata));
      }

      if (updateFields.length === 0) {
        return existing; // No updates needed
      }

      updateFields.push('updated_at = ?');
      updateValues.push(now);

      // Add WHERE conditions
      updateValues.push(appName, filename);

      db.execute(
        `UPDATE saved_artifacts
         SET ${updateFields.join(', ')}
         WHERE app_name = ? AND filename = ?`,
        updateValues
      );

      // Log the update event
      await this.trackUsage(appName, 'save', { filename, action: 'update' });

      AuditLogService.log(`Updated file: ${filename}`, appName, false, "SUCCESS");

      // Return updated artifact
      return updates.filename ? await this.getArtifact(appName, updates.filename) : await this.getArtifact(appName, filename);
    } catch (error: any) {
      console.error('SaveService.updateArtifact error:', error);
      AuditLogService.log(`Failed to update file: ${filename}`, appName, false, "FAILED");
      throw new Error(`Failed to update artifact: ${error.message}`);
    }
  }

  /**
   * Delete an artifact
   */
  async deleteArtifact(appName: string, filename: string): Promise<boolean> {
    try {
      if (!appName || !filename) {
        throw new Error('appName and filename are required');
      }

      const result = db.execute(
        `DELETE FROM saved_artifacts WHERE app_name = ? AND filename = ?`,
        [appName, filename]
      ) as any;

      const deleted = result.changes > 0;

      if (deleted) {
        AuditLogService.log(`Deleted file: ${filename}`, appName, false, "SUCCESS");
      }

      return deleted;
    } catch (error: any) {
      console.error('SaveService.deleteArtifact error:', error);
      AuditLogService.log(`Delete Artifact Error: ${error.message}`, appName, false, "FAILED", { filename });
      throw new Error(`Failed to delete artifact: ${error.message}`);
    }
  }

  /**
   * Track usage metrics
   */
  async trackUsage(appName: string, eventType: 'api_hit' | 'save' | 'generate' | 'api_error', metadata?: any): Promise<void> {
    try {
      console.log(`📊 Tracking usage: ${appName} - ${eventType}`);
      const metadataJson = metadata ? JSON.stringify(metadata) : null;

      db.execute(
        `INSERT INTO usage_metrics (app_name, event_type, metadata)
         VALUES (?, ?, ?)`,
        [appName, eventType, metadataJson]
      );
      console.log(`✅ Usage tracked: ${appName} - ${eventType}`);
    } catch (error: any) {
      console.error('SaveService.trackUsage error:', error);
      // Don't throw - usage tracking shouldn't break the main flow
    }
  }

  /**
   * Get usage metrics for all apps
   */
  async getUsageMetrics(): Promise<UsageMetrics[]> {
    try {
      console.log('📊 Server: Fetching usage metrics from database...');
      const allApps = ['texteditor', 'tripplanner', 'invitation', 'resumemaker'];

      const rows = db.query(`
        SELECT 
          m.app_name,
          SUM(CASE WHEN m.event_type = 'api_hit' THEN 1 ELSE 0 END) as api_hits,
          SUM(CASE WHEN m.event_type = 'generate' THEN 1 ELSE 0 END) as generated_artifacts,
          SUM(CASE WHEN m.event_type = 'api_error' THEN 1 ELSE 0 END) as api_errors,
          (SELECT COUNT(*) FROM saved_artifacts s WHERE s.app_name = m.app_name) as current_saved_count
        FROM usage_metrics m
        GROUP BY m.app_name
        ORDER BY m.app_name
      `);

      const metricsMap = new Map();
      rows.forEach((row: any) => {
        metricsMap.set(row.app_name, {
          appName: row.app_name as string,
          apiHits: row.api_hits as number,
          savedArtifacts: row.current_saved_count as number,
          generatedArtifacts: row.generated_artifacts as number,
          apiErrors: row.api_errors as number
        });
      });

      const result = allApps.map(appName => metricsMap.get(appName) || {
        appName,
        apiHits: 0,
        savedArtifacts: 0,
        generatedArtifacts: 0,
        apiErrors: 0
      });

      // console.log('📊 Server: Returning metrics:', result);
      return result;
    } catch (error: any) {
      console.error('SaveService.getUsageMetrics error:', error);
      throw new Error(`Failed to get usage metrics: ${error.message}`);
    }
  }

  /**
   * Get usage metrics for a specific app
   */
  async getAppUsageMetrics(appName: string): Promise<UsageMetrics | null> {
    try {
      const rows = db.query(`
        SELECT
          app_name,
          SUM(CASE WHEN event_type = 'api_hit' THEN 1 ELSE 0 END) as api_hits,
          SUM(CASE WHEN event_type = 'save' THEN 1 ELSE 0 END) as saved_artifacts,
          SUM(CASE WHEN event_type = 'generate' THEN 1 ELSE 0 END) as generated_artifacts,
          SUM(CASE WHEN event_type = 'api_error' THEN 1 ELSE 0 END) as api_errors
        FROM usage_metrics
        WHERE app_name = ?
        GROUP BY app_name
      `, [appName]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0] as any;
      return {
        appName: row.app_name as string,
        apiHits: row.api_hits as number,
        savedArtifacts: row.saved_artifacts as number,
        generatedArtifacts: row.generated_artifacts as number,
        apiErrors: row.api_errors as number
      };
    } catch (error: any) {
      console.error('SaveService.getAppUsageMetrics error:', error);
      throw new Error(`Failed to get app usage metrics: ${error.message}`);
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Test database connectivity
      const testQuery = db.query('SELECT COUNT(*) as count FROM saved_artifacts', []);
      const artifactCount = (testQuery[0] as any)?.count || 0;

      return {
        status: 'healthy',
        details: {
          database: 'connected',
          artifacts: artifactCount
        }
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message
        }
      };
    }
  }
}

export const saveService = new SaveService();

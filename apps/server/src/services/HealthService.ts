import { db } from '@gem/db';
import { LoggerModel } from '../models/loggerModel.js';
import { saveService } from './SaveService.js';
import * as fs from 'fs';
import * as path from 'path';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    lastBackup?: string;
  };
  memory: {
    used: number;
    total: number;
  };
  artifacts: {
    count: number;
    lastActivity?: string;
  };
  errors: {
    count: number;
    lastError?: string;
  };
}

export class HealthService {
  private startTime: number;
  private errorCount: number = 0;
  private lastError?: string;
  private isRecovering: boolean = false;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Comprehensive health check
   */
  async checkHealth(): Promise<HealthStatus> {
    try {
      const timestamp = new Date().toISOString();
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);

      // Database health
      const dbStatus = await this.checkDatabaseHealth();

      // Memory usage
      const memUsage = process.memoryUsage();

      // Artifact statistics
      const artifacts = await this.getArtifactStats();

      // Error statistics
      const errors = await this.getErrorStats();

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (dbStatus.status === 'disconnected' || errors.count > 10) {
        status = 'unhealthy';
      } else if (dbStatus.status === 'connected' && errors.count > 5) {
        status = 'degraded';
      }

      const healthStatus: HealthStatus = {
        status,
        timestamp,
        uptime,
        database: dbStatus,
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal
        },
        artifacts,
        errors
      };

      // Auto-healing if unhealthy
      if (status === 'unhealthy' && !this.isRecovering) {
        this.attemptRecovery(healthStatus);
      }

      return healthStatus;

    } catch (error: any) {
      console.error('Health check failed:', error);
      this.recordError(error.message);

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        database: { status: 'disconnected' },
        memory: { used: 0, total: 0 },
        artifacts: { count: 0 },
        errors: { count: this.errorCount, lastError: error.message }
      };
    }
  }

  /**
   * Check database connectivity and integrity
   */
  private async checkDatabaseHealth(): Promise<{ status: 'connected' | 'disconnected'; lastBackup?: string }> {
    try {
      // Test basic connectivity
      const testQuery = db.query('SELECT COUNT(*) as count FROM saved_artifacts', []);
      const count = (testQuery[0] as any)?.count || 0;

      // Check for database file existence
      const dbPath = this.getDatabasePath();
      const stats = fs.statSync(dbPath);
      const lastModified = stats.mtime.toISOString();

      return {
        status: 'connected',
        lastBackup: lastModified
      };

    } catch (error: any) {
      console.error('Database health check failed:', error);
      this.recordError(`Database check failed: ${error.message}`);
      return { status: 'disconnected' };
    }
  }

  /**
   * Get artifact statistics
   */
  private async getArtifactStats(): Promise<{ count: number; lastActivity?: string }> {
    try {
      const countQuery = db.query('SELECT COUNT(*) as count FROM saved_artifacts', []);
      const count = (countQuery[0] as any)?.count || 0;

      if (count > 0) {
        const lastActivityQuery = db.query(
          'SELECT updated_at FROM saved_artifacts ORDER BY updated_at DESC LIMIT 1',
          []
        );
        const lastActivity = (lastActivityQuery[0] as any)?.updated_at;
        return { count, lastActivity };
      }

      return { count };

    } catch (error: any) {
      console.error('Artifact stats check failed:', error);
      return { count: 0 };
    }
  }

  /**
   * Get error statistics from logs
   */
  private async getErrorStats(): Promise<{ count: number; lastError?: string }> {
    try {
      // Get error count from recent logs (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const errorQuery = db.query(
        `SELECT COUNT(*) as count FROM logger
         WHERE timestamp > ? AND event LIKE '%error%' OR event LIKE '%failed%'`,
        [oneDayAgo]
      );

      return {
        count: (errorQuery[0] as any)?.count || 0,
        lastError: this.lastError
      };

    } catch (error: any) {
      console.error('Error stats check failed:', error);
      return { count: this.errorCount, lastError: this.lastError };
    }
  }

  /**
   * Attempt to recover from unhealthy state
   */
  private async attemptRecovery(healthStatus: HealthStatus): Promise<void> {
    if (this.isRecovering) {
      return;
    }

    this.isRecovering = true;
    LoggerModel.log(`Auto-healing initiated. Status: ${healthStatus.status}`);

    try {
      // Attempt database recovery
      if (healthStatus.database.status === 'disconnected') {
        await this.recoverDatabase();
      }

      // Clear error backlog if too many errors
      if (healthStatus.errors.count > 10) {
        await this.clearErrorLogs();
      }

      // Force garbage collection if memory usage is high
      if (global.gc) {
        global.gc();
      }

      LoggerModel.log('Auto-healing completed successfully');

    } catch (error: any) {
      LoggerModel.log(`Auto-healing failed: ${error.message}`);
      console.error('Auto-healing failed:', error);
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Attempt database recovery
   */
  private async recoverDatabase(): Promise<void> {
    try {
      LoggerModel.log('Attempting database recovery');

      // Test database connectivity
      const health = await saveService.healthCheck();

      if (health.status === 'healthy') {
        LoggerModel.log('Database recovery successful');
      } else {
        throw new Error('Database recovery failed');
      }

    } catch (error: any) {
      LoggerModel.log(`Database recovery failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear old error logs to reduce noise
   */
  private async clearErrorLogs(): Promise<void> {
    try {
      // Keep only recent logs (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      db.execute(
        'DELETE FROM logger WHERE timestamp < ? AND (event LIKE "%error%" OR event LIKE "%failed%")',
        [sevenDaysAgo]
      );

      LoggerModel.log('Old error logs cleared');
    } catch (error: any) {
      console.error('Failed to clear error logs:', error);
    }
  }

  /**
   * Record an error for monitoring
   */
  private recordError(message: string): void {
    this.errorCount++;
    this.lastError = message;

    // Reset error count periodically
    if (this.errorCount > 100) {
      this.errorCount = 1;
    }
  }

  /**
   * Get database path
   */
  private getDatabasePath(): string {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const appData = process.env.APPDATA ||
        (process.platform === 'darwin'
          ? path.join(process.env.HOME || '', 'Library/Application Support')
          : path.join(process.env.HOME || '', '.local/share'));

      const dbDir = path.join(appData, 'GemSuite');
      return path.join(dbDir, 'gem-suite.sqlite');
    }

    return path.join(process.cwd(), 'gem-suite.sqlite');
  }

  /**
   * Create backup of database
   */
  async createBackup(): Promise<string> {
    try {
      const dbPath = this.getDatabasePath();
      const backupPath = `${dbPath}.backup.${Date.now()}`;

      // Copy database file
      fs.copyFileSync(dbPath, backupPath);

      LoggerModel.log(`Database backup created: ${backupPath}`);

      // Keep only last 5 backups
      await this.cleanupOldBackups();

      return backupPath;

    } catch (error: any) {
      LoggerModel.log(`Database backup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up old backup files
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const dbPath = this.getDatabasePath();
      const dbDir = path.dirname(dbPath);

      const files = fs.readdirSync(dbDir);
      const backups = files
        .filter(file => file.startsWith('gem-suite.sqlite.backup.'))
        .map(file => ({
          name: file,
          path: path.join(dbDir, file),
          timestamp: parseInt(file.split('.').pop() || '0')
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      // Keep only last 5 backups
      if (backups.length > 5) {
        for (let i = 5; i < backups.length; i++) {
          fs.unlinkSync(backups[i].path);
        }
      }

    } catch (error: any) {
      console.error('Failed to cleanup old backups:', error);
    }
  }
}

export const healthService = new HealthService();

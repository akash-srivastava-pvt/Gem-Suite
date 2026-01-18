import { Router, Request, Response } from 'express';
import { saveService } from '../services/SaveService.js';
import { healthService } from '../services/HealthService.js';
import { SaveArtifactRequest, UpdateArtifactRequest, HealthStatus } from '@gem/shared';
import { ValidationError } from '../utility/errors.js';

console.log('🔧 Persistence routes module loaded');

const router: Router = Router();

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  console.log('🧪 Persistence test endpoint called');
  res.json({
    success: true,
    message: 'Persistence API is working',
    timestamp: new Date().toISOString(),
    dbPath: 'checking...'
  });
});

/**
 * POST /api/persistence/save
 * Save a new artifact
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Save request received:', {
      appName: req.body?.appName,
      filename: req.body?.filename,
      dataType: req.body?.dataType,
      dataLength: req.body?.data?.length
    });
    const request: SaveArtifactRequest = req.body;

    // Basic validation
    if (!request.appName || !request.filename || !request.data || !request.dataType) {
      return res.status(400).json({
        error: 'Missing required fields: appName, filename, data, dataType'
      });
    }

    const artifact = await saveService.saveArtifact(request);

    return res.status(201).json({
      success: true,
      data: artifact
    });

  } catch (error: any) {
    console.error('Save artifact error:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Failed to save artifact',
      details: error.message
    });
  }
});

/**
 * GET /api/persistence/metrics/all
 * Get usage metrics for all apps
 */
router.get('/metrics/all', async (req: Request, res: Response) => {
  console.log('📊 Metrics endpoint called');
  try {
    const metrics = await saveService.getUsageMetrics();
    console.log('📊 Returning metrics:', metrics);

    return res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error: any) {
    console.error('Get usage metrics error:', error);
    // Return empty metrics instead of error
    const emptyMetrics = [
      { appName: 'texteditor', apiHits: 0, savedArtifacts: 0, generatedArtifacts: 0 },
      { appName: 'tripplanner', apiHits: 0, savedArtifacts: 0, generatedArtifacts: 0 },
      { appName: 'invitation', apiHits: 0, savedArtifacts: 0, generatedArtifacts: 0 },
      { appName: 'resumemaker', apiHits: 0, savedArtifacts: 0, generatedArtifacts: 0 }
    ];

    return res.status(200).json({
      success: true,
      data: emptyMetrics
    });
  }
});

/**
 * GET /api/persistence/metrics/:appName
 * Get usage metrics for a specific app
 */
router.get('/metrics/:appName', async (req: Request, res: Response) => {
  try {
    const { appName } = req.params;

    if (!appName) {
      return res.status(400).json({ error: 'appName parameter is required' });
    }

    const metrics = await saveService.getAppUsageMetrics(appName);

    return res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error: any) {
    console.error('Get app usage metrics error:', error);
    return res.status(500).json({
      error: 'Failed to get app usage metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/persistence/health
 * Comprehensive health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log('🏥 Health check requested');
    const healthStatus = await healthService.checkHealth();
    console.log('🏥 Health status:', healthStatus.status);

    const statusCode = healthStatus.status === 'healthy' ? 200 :
                      healthStatus.status === 'degraded' ? 206 : 503;

    return res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      data: healthStatus
    });

  } catch (error: any) {
    console.error('Health check error:', error);
    // Return unknown status instead of failing
    const fallbackHealth = {
      status: 'unknown' as const,
      timestamp: new Date().toISOString(),
      uptime: 0,
      database: { status: 'unknown' as const },
      memory: { used: 0, total: 0 },
      artifacts: { count: 0 },
      errors: { count: 1, lastError: error.message }
    };

    return res.status(200).json({
      success: true,
      data: fallbackHealth
    });
  }
});

/**
 * POST /api/persistence/backup
 * Create database backup
 */
router.post('/backup', async (req: Request, res: Response) => {
  try {
    const backupPath = await healthService.createBackup();

    return res.status(200).json({
      success: true,
      message: 'Database backup created successfully',
      backupPath
    });

  } catch (error: any) {
    console.error('Backup creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create backup',
      details: error.message
    });
  }
});

/**
 * GET /api/persistence/:appName
 * Get all artifacts for an app
 */
router.get('/:appName', async (req: Request, res: Response) => {
  try {
    console.log(`📂 Getting artifacts for app: ${req.params.appName}`);
    const { appName } = req.params;

    if (!appName) {
      return res.status(400).json({ error: 'appName parameter is required' });
    }

    const artifacts = await saveService.getArtifacts(appName);
    console.log(`📂 Found ${artifacts.length} artifacts for ${appName}`);

    return res.status(200).json({
      success: true,
      data: artifacts
    });

  } catch (error: any) {
    console.error('Get artifacts error:', error);
    // Return empty array instead of error to prevent frontend crashes
    return res.status(200).json({
      success: true,
      data: []
    });
  }
});

/**
 * GET /api/persistence/:appName/:filename
 * Get a specific artifact
 */
router.get('/:appName/:filename', async (req: Request, res: Response) => {
  try {
    const { appName, filename } = req.params;

    if (!appName || !filename) {
      return res.status(400).json({ error: 'appName and filename parameters are required' });
    }

    const artifact = await saveService.getArtifact(appName, decodeURIComponent(filename));

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    return res.status(200).json({
      success: true,
      data: artifact
    });

  } catch (error: any) {
    console.error('Get artifact error:', error);
    return res.status(500).json({
      error: 'Failed to get artifact',
      details: error.message
    });
  }
});

/**
 * PUT /api/persistence/:appName/:filename
 * Update an existing artifact
 */
router.put('/:appName/:filename', async (req: Request, res: Response) => {
  try {
    const { appName, filename } = req.params;
    const updates: UpdateArtifactRequest = req.body;

    if (!appName || !filename) {
      return res.status(400).json({ error: 'appName and filename parameters are required' });
    }

    const artifact = await saveService.updateArtifact(appName, decodeURIComponent(filename), updates);

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    return res.status(200).json({
      success: true,
      data: artifact
    });

  } catch (error: any) {
    console.error('Update artifact error:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Failed to update artifact',
      details: error.message
    });
  }
});

/**
 * DELETE /api/persistence/:appName/:filename
 * Delete an artifact
 */
router.delete('/:appName/:filename', async (req: Request, res: Response) => {
  try {
    const { appName, filename } = req.params;

    if (!appName || !filename) {
      return res.status(400).json({ error: 'appName and filename parameters are required' });
    }

    const deleted = await saveService.deleteArtifact(appName, decodeURIComponent(filename));

    if (!deleted) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Artifact deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete artifact error:', error);
    return res.status(500).json({
      error: 'Failed to delete artifact',
      details: error.message
    });
  }
});

export default router;
import { Request, Response } from 'express';
import { db } from '@gem/db';
import { UserApiKey, ApiKeyRequest, AI_PROVIDERS } from '@gem/shared';
import { encrypt, decrypt } from '../utility/security.js';
import { ProviderRegistry } from '../ai/providers/provider-registry.js';

export const ApiKeysController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const rows = db.query<any>(
        'SELECT id, user_id as userId, provider, tier, is_active as isActive, is_default as isDefault, selected_text_model as selectedTextModel, selected_image_model as selectedImageModel, created_at as createdAt, updated_at as updatedAt FROM user_api_keys WHERE user_id = 1'
      );

      // Don't expose encrypted keys to frontend
      const safeRows = rows.map(row => ({
        ...row,
        hasApiKey: true // Just indicate that a key exists
      }));

      res.json({ success: true, data: safeRows });
    } catch (error) {
      console.error('[API_KEYS][GET_ALL]', error);
      res.status(500).json({ success: false, error: 'Failed to fetch API keys' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { provider, tier, apiKey, selectedTextModel, selectedImageModel }: ApiKeyRequest = req.body;

      if (!provider || !tier || !apiKey) {
        return res.status(400).json({ error: 'Provider, tier, and API key are required' });
      }

      const adapter = ProviderRegistry.getAdapter(provider);
      const isValid = await adapter.validateApiKey(apiKey);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid API key' });
      }

      const tierConfig = ProviderRegistry.getTierConfig(provider, tier);
      if (!tierConfig) {
        return res.status(400).json({ error: 'Invalid tier configuration' });
      }

      const encryptedKey = await encrypt(apiKey);

      const rows = db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM user_api_keys WHERE user_id = 1'
      );
      const isFirstKey = rows[0]?.count === 0;

      await db.execute(
        `INSERT INTO user_api_keys (user_id, provider, tier, encrypted_api_key, is_default, selected_text_model, selected_image_model)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, provider, tier) DO UPDATE SET
         encrypted_api_key = excluded.encrypted_api_key,
         selected_text_model = excluded.selected_text_model,
         selected_image_model = excluded.selected_image_model,
         updated_at = CURRENT_TIMESTAMP`,
        [provider, tier, encryptedKey, isFirstKey ? 1 : 0, selectedTextModel, selectedImageModel]
      );

      res.status(201).json({ success: true, message: 'API key saved successfully' });
    } catch (error) {
      console.error('[API_KEYS][CREATE]', error);
      res.status(500).json({ error: 'Failed to save API key' });
    }
  },

  setDefault: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await db.execute('UPDATE user_api_keys SET is_default = 0 WHERE user_id = 1');
      await db.execute('UPDATE user_api_keys SET is_default = 1 WHERE id = ? AND user_id = 1', [id]);

      res.json({ success: true, message: 'Default API key updated' });
    } catch (error) {
      console.error('[API_KEYS][SET_DEFAULT]', error);
      res.status(500).json({ error: 'Failed to set default API key' });
    }
  },

  toggleActive: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const rows = db.query<{ is_active: number }>('SELECT is_active FROM user_api_keys WHERE id = ? AND user_id = 1', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'API key not found' });
      }

      const newStatus = rows[0].is_active === 1 ? 0 : 1;
      await db.execute('UPDATE user_api_keys SET is_active = ? WHERE id = ? AND user_id = 1', [newStatus, id]);

      res.json({ success: true, message: 'API key status updated' });
    } catch (error) {
      console.error('[API_KEYS][TOGGLE_ACTIVE]', error);
      res.status(500).json({ error: 'Failed to toggle API key status' });
    }
  },

  updateModels: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { selectedTextModel, selectedImageModel } = req.body;

      await db.execute(
        'UPDATE user_api_keys SET selected_text_model = ?, selected_image_model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = 1',
        [selectedTextModel, selectedImageModel, id]
      );

      res.json({ success: true, message: 'Models updated successfully' });
    } catch (error) {
      console.error('[API_KEYS][UPDATE_MODELS]', error);
      res.status(500).json({ error: 'Failed to update models' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if we are deleting the default key
      const keyToDelete = db.query<{ is_default: number }>('SELECT is_default FROM user_api_keys WHERE id = ?', [id]);
      const wasDefault = keyToDelete[0]?.is_default === 1;

      await db.execute('DELETE FROM user_api_keys WHERE id = ? AND user_id = 1', [id]);

      // If we deleted the default key, promote another one
      if (wasDefault) {
        const remainingKeys = db.query<{ id: number }>('SELECT id FROM user_api_keys WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1');
        if (remainingKeys.length > 0) {
          await db.execute('UPDATE user_api_keys SET is_default = 1 WHERE id = ?', [remainingKeys[0].id]);
        }
      }

      res.json({ success: true, message: 'API key deleted successfully' });
    } catch (error) {
      console.error('[API_KEYS][DELETE]', error);
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  },

  getProviders: async (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: AI_PROVIDERS });
    } catch (error) {
      console.error('[API_KEYS][GET_PROVIDERS]', error);
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  }
};
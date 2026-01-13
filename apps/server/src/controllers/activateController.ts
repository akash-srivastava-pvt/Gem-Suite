import { Request, Response } from 'express';
import { db } from '@gem/db';
import { Activate } from '@gem/shared';
import { decrypt, encrypt } from '../utility/security.js';
import { validateGeminiApiKey } from '../utility/helper.js';

export const ActivateController = {
  // GET /api/v1/activate
  get: async (_req: Request, res: Response) => {
    try {
      const rows = db.query<Activate>(
        'SELECT * FROM activate WHERE id = 1'
      );

      if (rows.length === 0) {
        return res.json({
          success: false,
          message: 'No activation key found',
        });
      }

      const encryptedKey = rows[0].apiKey;
      const apiKey = await decrypt(encryptedKey);

      const isValid = await validateGeminiApiKey(apiKey);

      return res.json({
        success: isValid,
        message: isValid
          ? 'User is authorised'
          : 'User is not authorised',
      });
    } catch (error) {
      console.error('[ACTIVATE][GET]', error);
      res.status(500).json({ error: 'Failed to authorise user' });
    }
  },

  // POST /api/v1/activate
  create: async (req: Request, res: Response) => {
    try {
      const { key } = req.body;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Key is required' });
      }

      const isValid = await validateGeminiApiKey(key);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid Gemini API key' });
      }

      const encryptedKey = encrypt(key);

      // UPSERT – ensures only one row with id = 1
      await db.execute(
        `
        INSERT INTO activate (id, key)
        VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET key = excluded.key
        `,
        [encryptedKey]
      );

      res.status(201).json({
        success: true,
        message: 'User activated successfully',
      });
    } catch (error) {
      console.error('[ACTIVATE][POST]', error);
      res.status(500).json({ error: 'Failed to save activation key' });
    }
  },
};

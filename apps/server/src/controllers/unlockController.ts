import { Request, Response } from 'express';
import { db } from '@gem/db';
import { User, UserApiKey, UnlockStatus, AI_PROVIDERS, ProviderConfig } from '@gem/shared';

export const UnlockController = {
  getStatus: async (_req: Request, res: Response) => {
    try {
      // Ensure default user exists with proper error handling
      let acceptedAgreement = false;

      try {
        const userRows = db.query<{ personalAgreement: number }>('SELECT personalAgreement FROM users WHERE id = 1');

        if (userRows.length === 0) {
          // No user found, so agreement hasn't been accepted
          acceptedAgreement = false;
        } else {
          acceptedAgreement = Boolean(userRows[0]?.personalAgreement);
        }
      } catch (dbError) {
        console.error('[UNLOCK][DB_ERROR]', dbError);
        // Fallback: assume agreement accepted to prevent blocking
        acceptedAgreement = true;
      }

      // Check for active API keys with proper error handling
      let hasActiveApiKey = false;
      let lockedApps: string[] = [];

      try {
        // Fetch the default key (prioritized) or any active key
        const apiKeyRows = db.query<{
          provider: string;
          tier: string;
          selected_text_model: string;
          selected_image_model: string;
        }>(
          `SELECT provider, tier, selected_text_model, selected_image_model 
           FROM user_api_keys 
           WHERE user_id = 1 AND is_active = 1 
           ORDER BY is_default DESC 
           LIMIT 1`
        );

        if (apiKeyRows.length > 0) {
          hasActiveApiKey = true;
          const key = apiKeyRows[0];

          const unlockedApps = new Set<string>();
          // Always allow profile
          unlockedApps.add('profile');

          // Find provider config
          const providerConfig = AI_PROVIDERS.find(p => p.providerId === key.provider);
          if (providerConfig) {
            const tierConfig = providerConfig.tiers.find(t => t.tierId === key.tier);
            if (tierConfig) {
              // Check allowed apps for text model
              if (key.selected_text_model) {
                const textModel = tierConfig.models.find(m => m.modelId === key.selected_text_model);
                if (textModel) {
                  textModel.allowedApps.forEach(app => unlockedApps.add(app));
                }
              }

              // Check allowed apps for image model
              if (key.selected_image_model) {
                const imageModel = tierConfig.models.find(m => m.modelId === key.selected_image_model);
                if (imageModel) {
                  imageModel.allowedApps.forEach(app => unlockedApps.add(app));
                }
              }
            }
          }

          // Calculate locked apps (all known apps - unlocked apps)
          const allKnownApps = ['texteditor', 'tripplanner', 'resumemaker', 'invitation']; // Hardcoded for now, or could derive
          lockedApps = allKnownApps.filter(app => !unlockedApps.has(app));
        } else {
          // No active key means everything is locked (except maybe profile, handled by frontend usually)
          lockedApps = ['texteditor', 'tripplanner', 'resumemaker', 'invitation'];
        }
      } catch (dbError) {
        console.error('[UNLOCK][API_KEY_CHECK_ERROR]', dbError);
        hasActiveApiKey = false;
        lockedApps = ['texteditor', 'tripplanner', 'resumemaker', 'invitation'];
      }

      const unlocked = hasActiveApiKey && acceptedAgreement;

      const status: UnlockStatus = {
        hasActiveApiKey,
        acceptedAgreement,
        unlocked,
        lockedApps: unlocked ? lockedApps : ['texteditor', 'tripplanner', 'resumemaker', 'invitation'] // If not unlocked globally, lock everything
      };

      res.json({ success: true, data: status });
    } catch (error) {
      console.error('[UNLOCK][GET_STATUS]', error);

      // Return safe fallback status instead of 500 error
      const fallbackStatus: UnlockStatus = {
        hasActiveApiKey: false,
        acceptedAgreement: true, // Allow access to profile to configure
        unlocked: false,
        lockedApps: ['texteditor', 'tripplanner', 'resumemaker', 'invitation']
      };

      res.json({ success: true, data: fallbackStatus });
    }
  }
};
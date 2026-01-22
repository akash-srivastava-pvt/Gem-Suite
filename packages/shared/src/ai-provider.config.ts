export interface ModelConfig {
  modelId: string;
  modality: 'text' | 'image' | 'audio' | 'multimodal';
  allowedApps: string[];
  isDefaultEligible: boolean;
}

export interface TierConfig {
  tierId: string;
  displayName: string;
  models: ModelConfig[];
}

export interface ProviderConfig {
  providerId: string;
  displayName: string;
  tiers: TierConfig[];
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    providerId: 'gemini',
    displayName: 'Google Gemini',
    tiers: [
      {
        tierId: 'free',
        displayName: 'Free Tier',
        models: [
          {
            modelId: 'gemini-3-flash-preview',
            modality: 'text',
            allowedApps: ['texteditor', 'tripplanner', 'resumemaker'],
            isDefaultEligible: true
          },
          {
            modelId: 'gemini-2.5-flash',
            modality: 'text',
            allowedApps: ['texteditor', 'tripplanner', 'resumemaker'],
            isDefaultEligible: true
          }
        ]
      },
      {
        tierId: 'paid',
        displayName: 'Paid Tier',
        models: [
          {
            modelId: 'gemini-2.0-flash',
            modality: 'text',
            allowedApps: ['texteditor', 'tripplanner', 'resumemaker'],
            isDefaultEligible: true
          },
          {
            modelId: 'gemini-3-flash-preview',
            modality: 'text',
            allowedApps: ['texteditor', 'tripplanner', 'resumemaker'],
            isDefaultEligible: true
          },
          {
            modelId: 'gemini-3-flash-image',
            modality: 'image',
            allowedApps: ['invitation'],
            isDefaultEligible: true
          },
          {
            modelId: 'gemini-2.5-flash-image',
            modality: 'image',
            allowedApps: ['invitation'],
            isDefaultEligible: true
          }
        ]
      }
    ]
  }
];
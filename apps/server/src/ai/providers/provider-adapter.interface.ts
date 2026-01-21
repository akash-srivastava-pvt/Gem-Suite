export interface ProviderAdapter {
  validateApiKey(apiKey: string): Promise<boolean>;
  executeText(apiKey: string, payload: any): Promise<any>;
  executeImage(apiKey: string, payload: any): Promise<any>;
}
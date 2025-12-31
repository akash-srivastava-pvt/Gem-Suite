export interface User {
  id?: number;
  name: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  version: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
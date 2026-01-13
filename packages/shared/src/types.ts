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
  success?: boolean;
  error?: string;
  message?: string;
}

export interface GeminiResponse {
    data: string;
}

export interface Activate {
    id: number;
    apiKey: string;
}

export interface ShellApp {
    id: string;
    name: string;
    icon: string;
    component: any;
}

export interface TripPromptInput {
  places: Array<string>;
  startDate: string;     
  endDate: string;       
  peopleCount: number;
  startLocation: string; 
  endLocation: string;   
  tripType: string;
};

export interface TripPlan {
  summary: {
    startPoint: string;
    endPoint: string;
    tripType: string;
    totalDays: number;
    citiesCovered: string[];
    routeOptimized: boolean;
  };
  itinerary: Array<{
    day: number;
    city: string;
    attractions: string[];
    travel: { mode: string; cost: number };
    stay: { type: string; cost: number };
    food: { type: string; cost: number };
    dailyTotalCost: number;
  }>;
  costBreakdown: {
    totalTripCost: number;
    costPerPerson: number;
  };
  tips: string[];
}

export type TextEditorIntent =
  | "grammar"
  | "rewrite"
  | "autocomplete"
  | "continue"
  | "translate"
  | "summarize";

export interface TextEditorInput {
  intent: TextEditorIntent;
  text: string;
  language?: string;
  tone?: string;
}

export interface Coordinates {
  top: number;
  left: number;
}
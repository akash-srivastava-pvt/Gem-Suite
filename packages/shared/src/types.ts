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
  description?: string;
  icon: any;
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

export type Religion = 'hindu' | 'muslim' | 'christian' | 'sikh' | 'other';
export type Language = 'english' | 'hindi' | 'urdu';

export type InvitationTheme =
  | 'wedding'
  | 'event'
  | 'greetings'
  | 'greetings';

export interface BaseInvitation {
  theme: InvitationTheme;
  religion?: Religion;
  language?: Language;
}

export interface WeddingInvitation extends BaseInvitation {
  theme: 'wedding';
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venue: string;
  familyDetails?: string;
  rsvpContact?: string;
}

export interface EventInvitation extends BaseInvitation {
  theme: 'event';
  eventType: string;
  eventName: string;
  date: string;
  venue: string;
  description?: string;
  rsvpContact?: string;
}

export interface GreetingInvitation extends BaseInvitation {
  theme: 'greetings';
  greetingType: string;
  greeting: string;
  date: string;
  fromName: string;
}

export type InvitationInput = WeddingInvitation | EventInvitation | GreetingInvitation;
export const TITLES: Record<Language, string> = {
  english: 'Wedding Invitation',
  hindi: 'विवाह निमंत्रण',
  urdu: 'دعوتِ نکاح',
};

export interface GeminiImageResponse {
  mimeType: string;
  base64: string;
}

export type GeminiImgResponse = {
  image: GeminiImageResponse;
};

export interface WizardState {
  step: 1 | 2 | 3;
  theme?: InvitationTheme;
  formData?: any;
  imageUrl?: string;
  loading?: boolean;
}
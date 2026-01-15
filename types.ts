
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  PULSE_AI = 'PULSE_AI',
  MEDIVIS = 'MEDIVIS',
  VAULT = 'VAULT',
  NEUROCARDS = 'NEUROCARDS',
  LIVE_CONSULTANT = 'LIVE_CONSULTANT'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Question {
  id: string;
  subject: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

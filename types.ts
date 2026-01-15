
export enum ViewType {
  PULSE_AI = 'PULSE_AI',
  MEDIVIS = 'MEDIVIS',
  VAULT = 'VAULT',
  NEUROCARDS = 'NEUROCARDS'
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

// Added GeneratedImage interface to support image generation history
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

// Added GeneratedVideo interface to support video generation history
export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

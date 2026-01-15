
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  PULSE_AI = 'PULSE_AI',
  MEDIVIS = 'MEDIVIS',
  VAULT = 'VAULT',
  NEUROCARDS = 'NEUROCARDS',
  LIVE_CONSULTANT = 'LIVE_CONSULTANT'
}

export enum Subject {
  ALL = 'All Subjects',
  ANATOMY = 'Anatomy',
  PHYSIOLOGY = 'Physiology',
  BIOCHEMISTRY = 'Biochemistry',
  PATHOLOGY = 'Pathology',
  PHARMACOLOGY = 'Pharmacology',
  MICROBIOLOGY = 'Microbiology',
  FORENSIC = 'Forensic Medicine',
  PSM = 'Community Medicine',
  ENT = 'ENT',
  OPHTHALMOLOGY = 'Ophthalmology',
  PEDIATRICS = 'Pediatrics',
  MEDICINE = 'General Medicine',
  SURGERY = 'General Surgery',
  OBG = 'Obstetrics & Gynae'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Question {
  subject: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'High-Yield' | 'Standard' | 'Elite';
}

export interface Flashcard {
  front: string;
  back: string;
  subject: string;
  highYieldPoint: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

// Added GeneratedVideo interface to support the VideoView component
export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

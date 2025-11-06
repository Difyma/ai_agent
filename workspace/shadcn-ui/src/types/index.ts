export interface Client {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'unknown';
  goals: string[];
  workouts: {
    frequency: number;
    type: string[];
    intensity: 'low' | 'medium' | 'high';
  };
  nutrition: {
    diet: string;
    restrictions: string[];
    preferences: string[];
  };
  healthData: {
    weight: number;
    height: number;
    bmi: number;
    bloodTests: {
      vitamin_d?: number;
      b12?: number;
      iron?: number;
      magnesium?: number;
    };
    issues: string[];
  };
  purchaseHistory: string[];
}

export interface Supplement {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  price: number;
  ingredients: string[];
  dosage: string;
  contraindications: string[];
  image: string;
  volume?: string;
  effect?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  supplementRecommendations?: string[];
}

export interface AIResponse {
  message: string;
  recommendations?: string[];
  followUpQuestions?: string[];
}
import { gambits1 } from "./data/gambits1";
import { gambits2 } from "./data/gambits2";
import { gambits3 } from "./data/gambits3";

export interface Gambit {
  id: string;
  name: string;
  eco: string;
  category?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  side: "White" | "Black";
  shortDesc: string;
  estimatedTime?: string;
  popularity: number; // 0 - 100
  successRate: number; // percentage
  history: string;
  inventor: string;
  playingStyle: string;
  whenToUse: string;
  recommendedSkillLevel?: string;
  advantages?: string[];
  disadvantages?: string[];
  commonTraps?: string[];
  moves: string[]; // Standard moves list
  explanations: string[]; // Match index of moves
  acceptedVariation: {
    name: string;
    moves: string[];
    explanation: string;
  };
  declinedVariation: {
    name: string;
    moves: string[];
    explanation: string;
  };
  popularVariations: string[];
  strategicIdeas: string[];
  tacticalMotifs: string[];
  commonMistakes: string[];
  bestResponses: string[];
  typicalCheckmatePatterns: string[];
  middlegamePlans?: string[];
  endgameIdeas?: string[];
  famousGames: string[];
  grandmasterExamples: string[];
  practicePosition: {
    fen: string;
    prompt: string;
    solution: string[]; // coordinates or SAN moves
  };
  quiz: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  };
}

export const GAMBITS: Gambit[] = [
  ...gambits1,
  ...gambits2,
  ...gambits3
];

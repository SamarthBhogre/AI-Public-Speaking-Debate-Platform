import { SpeakingTopic, DebateTopic, DebateResponse, SpeakingEvaluation, DebateEvaluation } from '../../types';

export interface GenerateSpeakingTopicInput {
  category?: string;
  difficulty?: string;
}

export interface GenerateDebateResponseInput {
  topic: string;
  position: string;
  round: number;
  studentResponse: string;
  conversationHistory: { prompt: string; response: string }[];
}

export interface EvaluateSpeakingInput {
  topic: string;
  transcript: string;
  durationSeconds: number;
  wordCount: number;
}

export interface EvaluateDebateInput {
  topic: string;
  position: string;
  rounds: { prompt: string; studentResponse: string }[];
}

export interface AIService {
  generateSpeakingTopic(input: GenerateSpeakingTopicInput): Promise<SpeakingTopic>;
  generateDebateTopic(): Promise<DebateTopic>;
  generateDebateResponse(input: GenerateDebateResponseInput): Promise<DebateResponse>;
  evaluateSpeaking(input: EvaluateSpeakingInput): Promise<SpeakingEvaluation>;
  evaluateDebate(input: EvaluateDebateInput): Promise<DebateEvaluation>;
}

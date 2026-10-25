import { apiClient } from './apiClient';
import { AnalyticsOverview } from '../types';

export interface BreakdownPoint { category?: string; difficulty?: string; count: number; avg_score: number; }
export interface TrendPoint { date: string; avg_score: number; }
export interface SpeakingAnalytics {
  scoreOverTime: TrendPoint[];
  categoryBreakdown: BreakdownPoint[];
  difficultyBreakdown: BreakdownPoint[];
  wordCountGrowth: { date: string; avg_word_count: number }[];
  avgDuration: number;
}

export const analyticsService = {
  getOverview: () => apiClient.get<AnalyticsOverview>('/analytics/overview'),
  getSpeaking: () => apiClient.get<SpeakingAnalytics>('/analytics/speaking'),
  getDebate: () => apiClient.get<{ scoreOverTime: TrendPoint[]; topicBreakdown: {topic:string;count:number;avg_score:number;best_score:number}[] }>('/analytics/debate'),
  getStreak: () => apiClient.get<{ current: number; longest: number }>('/analytics/streak'),
};

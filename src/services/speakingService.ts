import { apiClient } from './apiClient';
import { SpeakingSession } from '../types';

export const speakingService = {
  getTopic: (category?: string, difficulty?: string) =>
    apiClient.post<{ topic: string; category: string; difficulty: string }>('/speaking/topic', { category, difficulty }),

  createSession: (data: {
    topic: string; category: string; difficulty: string;
    transcript: string; durationSeconds: number; wordCount: number;
  }) => apiClient.post<{ session: SpeakingSession }>('/speaking/session', data),

  getHistory: () => apiClient.get<{ sessions: SpeakingSession[] }>('/speaking/history'),

  getById: (id: string) => apiClient.get<{ session: SpeakingSession }>(`/speaking/${id}`),
};

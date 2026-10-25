import { apiClient } from './apiClient';
import { DebateSession } from '../types';

export const debateService = {
  getTopic: () =>
    apiClient.post<{ topic: string; for_stance: string; against_stance: string }>('/debate/topic', {}),

  startSession: (data: { topic: string; position: 'FOR' | 'AGAINST' }) =>
    apiClient.post<{ sessionId: string; openingPrompt: string }>('/debate/session', data),

  respond: (data: { sessionId: string; roundNumber: number; studentResponse: string }) =>
    apiClient.post<{ aiResponse: string; nextPrompt: string | null; isLastRound: boolean }>('/debate/respond', data),

  evaluate: (data: { sessionId: string }) =>
    apiClient.post<{ score: number; feedback: string }>('/debate/evaluate', data),

  getHistory: () => apiClient.get<{ sessions: DebateSession[] }>('/debate/history'),

  getById: (id: string) => apiClient.get<{ session: DebateSession }>(`/debate/${id}`),
};

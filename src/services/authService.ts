import { apiClient } from './apiClient';
import { User } from '../types';

export const authService = {
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
    apiClient.post<{ user: User; message: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ user: User; message: string }>('/auth/login', data),

  logout: () => apiClient.post<{ message: string }>('/auth/logout', {}),

  me: () => apiClient.get<{ user: User }>('/auth/me'),
};

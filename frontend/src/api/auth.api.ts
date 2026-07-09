import api from './axios';
import type { AuthTokens, MeResponse } from '../types/auth.types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  me: async (): Promise<MeResponse> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

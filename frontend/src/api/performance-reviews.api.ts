import api from './axios';
import type { PerformanceReview, ReviewStatus } from '../types/performance-review.types';

export const performanceReviewsApi = {
  list: async (): Promise<PerformanceReview[]> => {
    const res = await api.get('/performance-reviews');
    return res.data.data ?? res.data ?? [];
  },
  getById: async (id: string): Promise<PerformanceReview> => {
    const res = await api.get(`/performance-reviews/${id}`);
    return res.data.data ?? res.data;
  },
  create: async (data: { reviewPeriod: string; selfRating: number; selfComments: string }): Promise<PerformanceReview> => {
    const res = await api.post('/performance-reviews', data);
    return res.data.data ?? res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/performance-reviews/${id}`);
  },
  updateSelf: async (id: string, data: { reviewPeriod?: string; selfRating?: number; selfComments?: string }): Promise<PerformanceReview> => {
    const res = await api.patch(`/performance-reviews/${id}/self`, data);
    return res.data.data ?? res.data;
  },
  review: async (id: string, data: { managerRating?: number; managerComments?: string; status?: ReviewStatus }): Promise<PerformanceReview> => {
    const res = await api.patch(`/performance-reviews/${id}`, data);
    return res.data.data ?? res.data;
  },
};

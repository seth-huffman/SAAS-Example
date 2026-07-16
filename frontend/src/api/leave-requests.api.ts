import api from './axios';
import type { LeaveRequest, CreateLeaveRequestPayload } from '../types/leave-request.types';
import type { PaginatedResponse } from '../types/employee.types';

export const leaveRequestsApi = {
  list: async (page = 1, limit = 20): Promise<PaginatedResponse<LeaveRequest>> => {
    const res = await api.get(`/leave-requests?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  listMine: async (): Promise<LeaveRequest[]> => {
    const res = await api.get('/leave-requests?page=1&limit=200');
    const payload = res.data.data;
    return payload?.data ?? payload ?? [];
  },
  listPending: async (): Promise<LeaveRequest[]> => {
    const res = await api.get('/leave-requests?page=1&limit=100');
    const all: LeaveRequest[] = res.data.data?.data ?? res.data.data ?? [];
    return all.filter((r) => r.status === 'pending');
  },
  getById: async (id: string): Promise<LeaveRequest> => {
    const res = await api.get(`/leave-requests/${id}`);
    return res.data.data;
  },
  create: async (data: CreateLeaveRequestPayload): Promise<LeaveRequest> => {
    const res = await api.post('/leave-requests', data);
    return res.data.data;
  },
  approve: async (id: string, reviewNote?: string): Promise<LeaveRequest> => {
    const res = await api.patch(`/leave-requests/${id}/approve`, { reviewNote });
    return res.data.data;
  },
  reject: async (id: string, reviewNote?: string): Promise<LeaveRequest> => {
    const res = await api.patch(`/leave-requests/${id}/reject`, { reviewNote });
    return res.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/leave-requests/${id}`);
  },
};

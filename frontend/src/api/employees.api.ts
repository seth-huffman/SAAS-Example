import api from './axios';
import type { Employee, EmployeeFilters, PaginatedResponse } from '../types/employee.types';

export const employeesApi = {
  me: async (): Promise<Employee> => {
    const res = await api.get('/employees/me');
    return res.data.data ?? res.data;
  },
  list: async (filters: EmployeeFilters): Promise<PaginatedResponse<Employee>> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.departmentId) params.set('departmentId', filters.departmentId);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const res = await api.get(`/employees?${params}`);
    return res.data.data;
  },
  getById: async (id: string): Promise<Employee> => {
    const res = await api.get(`/employees/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Employee>): Promise<Employee> => {
    const res = await api.post('/employees', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const res = await api.patch(`/employees/${id}`, data);
    return res.data.data;
  },
  terminate: async (id: string): Promise<Employee> => {
    const res = await api.patch(`/employees/${id}/terminate`);
    return res.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};

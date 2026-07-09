import api from './axios';
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '../types/department.types';
import type { Employee, PaginatedResponse } from '../types/employee.types';

export const departmentsApi = {
  list: async (): Promise<Department[]> => {
    const res = await api.get('/departments');
    return res.data.data;
  },
  getById: async (id: string): Promise<Department> => {
    const res = await api.get(`/departments/${id}`);
    return res.data.data;
  },
  getMembers: async (id: string, page = 1, limit = 20): Promise<PaginatedResponse<Employee>> => {
    const res = await api.get(`/departments/${id}/members?page=${page}&limit=${limit}`);
    return res.data.data;
  },
  create: async (data: CreateDepartmentPayload): Promise<Department> => {
    const res = await api.post('/departments', data);
    return res.data.data;
  },
  update: async (id: string, data: UpdateDepartmentPayload): Promise<Department> => {
    const res = await api.patch(`/departments/${id}`, data);
    return res.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },
};

import type { Employee } from './employee.types';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  manager?: Employee;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  managerId?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
  managerId?: string | null;
}

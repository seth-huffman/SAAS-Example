export type EmployeeStatus = 'active' | 'inactive' | 'terminated';
export type WorkType       = 'onsite' | 'hybrid' | 'remote';

export interface Department {
  id: string;
  name: string;
  description: string | null;
}

export interface Employee {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  birthDate: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  status: EmployeeStatus;
  workType: WorkType | null;
  salary: number | null;
  bonus: number | null;
  supervisorId: string | null;
  supervisor?: Pick<Employee, 'id' | 'firstName' | 'lastName'>;
  departmentId: string | null;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  departmentId?: string;
  page?: number;
  limit?: number;
}

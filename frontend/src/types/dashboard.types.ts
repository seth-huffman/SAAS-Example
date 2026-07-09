import type { Employee } from './employee.types';

export interface DepartmentBreakdown {
  departmentId: string;
  departmentName: string;
  count: number;
}

export interface DashboardStats {
  headcount: number;
  totalDepartments: number;
  pendingLeaves: number;
  recentHires: Employee[];
  departmentBreakdown: DepartmentBreakdown[];
}

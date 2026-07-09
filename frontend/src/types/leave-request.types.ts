import type { Employee } from './employee.types';

export type LeaveType     = 'vacation' | 'sick' | 'personal' | 'other';
export type LeaveStatus   = 'pending' | 'approved' | 'rejected';
export type HalfDayPeriod = 'morning' | 'afternoon';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  isHalfDay: boolean;
  halfDayPeriod: HalfDayPeriod | null;
  status: LeaveStatus;
  reviewedById: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestPayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: HalfDayPeriod;
}

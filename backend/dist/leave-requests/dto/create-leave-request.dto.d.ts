import { HalfDayPeriod, LeaveType } from '../entities/leave-request.entity';
export declare class CreateLeaveRequestDto {
    employeeId?: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason?: string;
    isHalfDay?: boolean;
    halfDayPeriod?: HalfDayPeriod;
}

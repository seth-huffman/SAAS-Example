import { Employee } from '../../employees/entities/employee.entity';
export declare enum LeaveType {
    VACATION = "vacation",
    SICK = "sick",
    PERSONAL = "personal",
    OTHER = "other"
}
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum HalfDayPeriod {
    MORNING = "morning",
    AFTERNOON = "afternoon"
}
export declare class LeaveRequest {
    id: string;
    employeeId: string;
    employee: Employee;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string | null;
    isHalfDay: boolean;
    halfDayPeriod: HalfDayPeriod | null;
    status: LeaveStatus;
    reviewedById: string | null;
    reviewNote: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

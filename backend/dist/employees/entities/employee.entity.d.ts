import { Department } from '../../departments/entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { LeaveRequest } from '../../leave-requests/entities/leave-request.entity';
export declare enum EmployeeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    TERMINATED = "terminated"
}
export declare enum WorkType {
    ONSITE = "onsite",
    HYBRID = "hybrid",
    REMOTE = "remote"
}
export declare class Employee {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    phone: string | null;
    jobTitle: string | null;
    birthDate: Date | null;
    hireDate: Date | null;
    terminationDate: Date | null;
    status: EmployeeStatus;
    workType: WorkType | null;
    salary: number | null;
    bonus: number | null;
    supervisorId: string | null;
    supervisor: Employee;
    departmentId: string | null;
    department: Department;
    userId: string | null;
    user: User;
    leaveRequests: LeaveRequest[];
    createdAt: Date;
    updatedAt: Date;
}

import { EmployeeStatus, WorkType } from '../entities/employee.entity';
export declare class UpdateEmployeeDto {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    birthDate?: string;
    hireDate?: string;
    status?: EmployeeStatus;
    workType?: WorkType | null;
    salary?: number;
    bonus?: number | null;
    supervisorId?: string | null;
    departmentId?: string | null;
    userId?: string | null;
}

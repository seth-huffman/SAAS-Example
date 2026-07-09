import { EmployeeStatus } from '../entities/employee.entity';
export declare class CreateEmployeeDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    hireDate?: string;
    status?: EmployeeStatus;
    salary?: number;
    departmentId?: string;
    userId?: string;
}

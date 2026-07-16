import { Employee } from '../../employees/entities/employee.entity';
export declare class Department {
    id: string;
    name: string;
    description: string | null;
    managerId: string | null;
    manager: Employee;
    employees: Employee[];
    createdAt: Date;
    updatedAt: Date;
}

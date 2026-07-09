import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFilterDto } from './dto/employee-filter.dto';
interface RequestUser {
    userId: string;
    role: UserRole;
}
export declare class EmployeesService {
    private empRepo;
    constructor(empRepo: Repository<Employee>);
    findAll(filters: EmployeeFilterDto): Promise<{
        data: Employee[];
        total: number;
        page: number;
        limit: number;
    }>;
    findMe(userId: string): Promise<Employee>;
    findById(id: string, requestUser?: RequestUser): Promise<Employee>;
    create(dto: CreateEmployeeDto): Promise<Employee>;
    update(id: string, dto: UpdateEmployeeDto): Promise<Employee>;
    terminate(id: string): Promise<Employee>;
    remove(id: string): Promise<void>;
}
export {};

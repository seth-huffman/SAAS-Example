import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFilterDto } from './dto/employee-filter.dto';
import { UserRole } from '../users/entities/user.entity';
interface AuthUser {
    userId: string;
    email: string;
    role: UserRole;
}
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    findAll(filters: EmployeeFilterDto): Promise<{
        data: import("./entities/employee.entity").Employee[];
        total: number;
        page: number;
        limit: number;
    }>;
    findMe(user: AuthUser): Promise<import("./entities/employee.entity").Employee>;
    findOne(id: string, user: AuthUser): Promise<import("./entities/employee.entity").Employee>;
    create(dto: CreateEmployeeDto): Promise<import("./entities/employee.entity").Employee>;
    update(id: string, dto: UpdateEmployeeDto): Promise<import("./entities/employee.entity").Employee>;
    terminate(id: string): Promise<import("./entities/employee.entity").Employee>;
    remove(id: string): Promise<void>;
}
export {};

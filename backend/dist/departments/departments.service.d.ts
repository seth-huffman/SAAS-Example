import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class DepartmentsService {
    private deptRepo;
    private empRepo;
    constructor(deptRepo: Repository<Department>, empRepo: Repository<Employee>);
    findAll(): Promise<Department[]>;
    findById(id: string): Promise<Department>;
    getMembers(id: string, pagination: PaginationDto): Promise<{
        data: Employee[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(dto: CreateDepartmentDto): Promise<Department>;
    update(id: string, dto: UpdateDepartmentDto): Promise<Department>;
    remove(id: string): Promise<void>;
}

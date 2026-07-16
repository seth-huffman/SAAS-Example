import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    findAll(): Promise<import("./entities/department.entity").Department[]>;
    findOne(id: string): Promise<import("./entities/department.entity").Department>;
    getMembers(id: string, pagination: PaginationDto): Promise<{
        data: import("../employees/entities/employee.entity").Employee[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(dto: CreateDepartmentDto): Promise<import("./entities/department.entity").Department>;
    update(id: string, dto: UpdateDepartmentDto): Promise<import("./entities/department.entity").Department>;
    remove(id: string): Promise<void>;
}

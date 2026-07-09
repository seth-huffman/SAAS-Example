import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmployeeStatus } from '../entities/employee.entity';
export declare class EmployeeFilterDto extends PaginationDto {
    search?: string;
    status?: EmployeeStatus;
    departmentId?: string;
}

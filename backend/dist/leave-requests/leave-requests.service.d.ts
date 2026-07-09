import { Repository } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { Employee } from '../employees/entities/employee.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
interface RequestUser {
    userId: string;
    role: UserRole;
}
export declare class LeaveRequestsService {
    private leaveRepo;
    private empRepo;
    constructor(leaveRepo: Repository<LeaveRequest>, empRepo: Repository<Employee>);
    findAll(pagination: PaginationDto, requestUser: RequestUser): Promise<{
        data: LeaveRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string, requestUser?: RequestUser): Promise<LeaveRequest>;
    create(dto: CreateLeaveRequestDto, requestUser: RequestUser): Promise<LeaveRequest>;
    approve(id: string, dto: UpdateLeaveStatusDto, reviewerId: string): Promise<LeaveRequest>;
    reject(id: string, dto: UpdateLeaveStatusDto, reviewerId: string): Promise<LeaveRequest>;
    remove(id: string): Promise<void>;
}
export {};

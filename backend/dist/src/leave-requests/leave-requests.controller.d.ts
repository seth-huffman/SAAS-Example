import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { UserRole } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
interface AuthUser {
    userId: string;
    email: string;
    role: UserRole;
}
export declare class LeaveRequestsController {
    private readonly leaveRequestsService;
    constructor(leaveRequestsService: LeaveRequestsService);
    findAll(pagination: PaginationDto, user: AuthUser): Promise<{
        data: import("./entities/leave-request.entity").LeaveRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: AuthUser): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    create(dto: CreateLeaveRequestDto, user: AuthUser): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    approve(id: string, dto: UpdateLeaveStatusDto, user: AuthUser): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    reject(id: string, dto: UpdateLeaveStatusDto, user: AuthUser): Promise<import("./entities/leave-request.entity").LeaveRequest>;
    remove(id: string, user: AuthUser): Promise<void>;
}
export {};

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_request_entity_1 = require("./entities/leave-request.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const user_entity_1 = require("../users/entities/user.entity");
let LeaveRequestsService = class LeaveRequestsService {
    leaveRepo;
    empRepo;
    constructor(leaveRepo, empRepo) {
        this.leaveRepo = leaveRepo;
        this.empRepo = empRepo;
    }
    async findAll(pagination, requestUser) {
        const { page = 1, limit = 20 } = pagination;
        const qb = this.leaveRepo
            .createQueryBuilder('lr')
            .leftJoinAndSelect('lr.employee', 'emp')
            .orderBy('lr.createdAt', 'DESC')
            .take(limit)
            .skip((page - 1) * limit);
        if (requestUser.role === user_entity_1.UserRole.EMPLOYEE) {
            const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
            if (!emp)
                return { data: [], total: 0, page, limit };
            qb.andWhere('lr.employeeId = :empId', { empId: emp.id });
        }
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async findById(id, requestUser) {
        const lr = await this.leaveRepo.findOne({ where: { id }, relations: { employee: true } });
        if (!lr)
            throw new common_1.NotFoundException('Leave request not found');
        if (requestUser?.role === user_entity_1.UserRole.EMPLOYEE) {
            const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
            if (!emp || emp.id !== lr.employeeId)
                throw new common_1.ForbiddenException('Access denied');
        }
        return lr;
    }
    async create(dto, requestUser) {
        let employeeId = dto.employeeId;
        if (!employeeId || requestUser.role === user_entity_1.UserRole.EMPLOYEE) {
            const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
            if (!emp)
                throw new common_1.BadRequestException('No employee record linked to your account');
            employeeId = emp.id;
        }
        if (new Date(dto.startDate) > new Date(dto.endDate)) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const lr = this.leaveRepo.create({
            employeeId,
            leaveType: dto.leaveType,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            reason: dto.reason ?? null,
            isHalfDay: dto.isHalfDay ?? false,
            halfDayPeriod: dto.halfDayPeriod ?? null,
            status: leave_request_entity_1.LeaveStatus.PENDING,
        });
        return this.leaveRepo.save(lr);
    }
    async approve(id, dto, reviewerId) {
        const lr = await this.findById(id);
        if (lr.status !== leave_request_entity_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending requests can be approved');
        }
        lr.status = leave_request_entity_1.LeaveStatus.APPROVED;
        lr.reviewedById = reviewerId;
        lr.reviewNote = dto.reviewNote ?? null;
        lr.reviewedAt = new Date();
        return this.leaveRepo.save(lr);
    }
    async reject(id, dto, reviewerId) {
        const lr = await this.findById(id);
        if (lr.status !== leave_request_entity_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending requests can be rejected');
        }
        lr.status = leave_request_entity_1.LeaveStatus.REJECTED;
        lr.reviewedById = reviewerId;
        lr.reviewNote = dto.reviewNote ?? null;
        lr.reviewedAt = new Date();
        return this.leaveRepo.save(lr);
    }
    async remove(id) {
        const lr = await this.findById(id);
        await this.leaveRepo.remove(lr);
    }
};
exports.LeaveRequestsService = LeaveRequestsService;
exports.LeaveRequestsService = LeaveRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveRequestsService);
//# sourceMappingURL=leave-requests.service.js.map
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveStatus } from './entities/leave-request.entity';
import { Employee } from '../employees/entities/employee.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

interface RequestUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest) private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
  ) {}

  async findAll(pagination: PaginationDto, requestUser: RequestUser) {
    const { page = 1, limit = 20 } = pagination;

    const qb = this.leaveRepo
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.employee', 'emp')
      .orderBy('lr.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (requestUser.role === UserRole.EMPLOYEE) {
      const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
      if (!emp) return { data: [], total: 0, page, limit };
      qb.andWhere('lr.employeeId = :empId', { empId: emp.id });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string, requestUser?: RequestUser): Promise<LeaveRequest> {
    const lr = await this.leaveRepo.findOne({ where: { id }, relations: { employee: true } });
    if (!lr) throw new NotFoundException('Leave request not found');

    if (requestUser?.role === UserRole.EMPLOYEE) {
      const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
      if (!emp || emp.id !== lr.employeeId) throw new ForbiddenException('Access denied');
    }
    return lr;
  }

  async create(dto: CreateLeaveRequestDto, requestUser: RequestUser): Promise<LeaveRequest> {
    let employeeId = dto.employeeId;

    if (!employeeId || requestUser.role === UserRole.EMPLOYEE) {
      const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
      if (!emp) throw new BadRequestException('No employee record linked to your account');
      employeeId = emp.id;
    }

    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const lr = this.leaveRepo.create({
      employeeId,
      leaveType:    dto.leaveType,
      startDate:    new Date(dto.startDate),
      endDate:      new Date(dto.endDate),
      reason:       dto.reason       ?? null,
      isHalfDay:    dto.isHalfDay    ?? false,
      halfDayPeriod: dto.halfDayPeriod ?? null,
      status: LeaveStatus.PENDING,
    });
    return this.leaveRepo.save(lr);
  }

  async approve(id: string, dto: UpdateLeaveStatusDto, reviewerId: string): Promise<LeaveRequest> {
    const lr = await this.findById(id);
    if (lr.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }
    lr.status = LeaveStatus.APPROVED;
    lr.reviewedById = reviewerId;
    lr.reviewNote = dto.reviewNote ?? null;
    lr.reviewedAt = new Date();
    return this.leaveRepo.save(lr);
  }

  async reject(id: string, dto: UpdateLeaveStatusDto, reviewerId: string): Promise<LeaveRequest> {
    const lr = await this.findById(id);
    if (lr.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }
    lr.status = LeaveStatus.REJECTED;
    lr.reviewedById = reviewerId;
    lr.reviewNote = dto.reviewNote ?? null;
    lr.reviewedAt = new Date();
    return this.leaveRepo.save(lr);
  }

  async remove(id: string): Promise<void> {
    const lr = await this.findById(id);
    await this.leaveRepo.remove(lr);
  }
}

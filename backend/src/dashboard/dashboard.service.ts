import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { LeaveRequest, LeaveStatus } from '../leave-requests/entities/leave-request.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(LeaveRequest) private leaveRepo: Repository<LeaveRequest>,
  ) {}

  async getStats() {
    const [headcount, totalDepartments, pendingLeaves, recentHires, deptBreakdownRaw] =
      await Promise.all([
        this.empRepo.count({ where: { status: EmployeeStatus.ACTIVE } }),
        this.deptRepo.count(),
        this.leaveRepo.count({ where: { status: LeaveStatus.PENDING } }),
        this.empRepo.find({
          where: { status: EmployeeStatus.ACTIVE },
          order: { hireDate: 'DESC' },
          take: 5,
          relations: { department: true },
        }),
        this.empRepo
          .createQueryBuilder('e')
          .select('e.departmentId', 'departmentId')
          .addSelect('dept.name', 'departmentName')
          .addSelect('COUNT(e.id)', 'count')
          .leftJoin('e.department', 'dept')
          .where('e.status = :status', { status: EmployeeStatus.ACTIVE })
          .groupBy('e.departmentId')
          .addGroupBy('dept.name')
          .getRawMany(),
      ]);

    const departmentBreakdown = deptBreakdownRaw.map((r) => ({
      departmentId: r.departmentId,
      departmentName: r.departmentName ?? 'Unassigned',
      count: parseInt(r.count, 10),
    }));

    return {
      headcount,
      totalDepartments,
      pendingLeaves,
      recentHires,
      departmentBreakdown,
    };
  }
}

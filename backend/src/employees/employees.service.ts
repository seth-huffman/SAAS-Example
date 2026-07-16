import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from './entities/employee.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFilterDto } from './dto/employee-filter.dto';

interface RequestUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class EmployeesService {
  constructor(@InjectRepository(Employee) private empRepo: Repository<Employee>) {}

  async findAll(filters: EmployeeFilterDto) {
    const { search, status, departmentId, page = 1, limit = 20 } = filters;

    const qb = this.empRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.department', 'dept')
      .leftJoinAndSelect('e.supervisor', 'supervisor')
      .orderBy('e.lastName', 'ASC')
      .take(limit)
      .skip((page - 1) * limit);

    if (search) {
      qb.andWhere(
        '(LOWER(e.firstName) LIKE :s OR LOWER(e.lastName) LIKE :s OR LOWER(e.email) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }
    if (status) {
      qb.andWhere('e.status = :status', { status });
    }
    if (departmentId) {
      qb.andWhere('e.departmentId = :departmentId', { departmentId });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findMe(userId: string): Promise<Employee> {
    const employee = await this.empRepo.findOne({
      where: { userId },
      relations: { department: true, user: true, supervisor: true },
    });
    if (!employee) throw new NotFoundException('Employee record not found for this account');
    return employee;
  }

  async findById(id: string, requestUser?: RequestUser): Promise<Employee> {
    const employee = await this.empRepo.findOne({
      where: { id },
      relations: { department: true, user: true, supervisor: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    if (requestUser?.role === UserRole.EMPLOYEE) {
      const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
      if (!emp || emp.id !== id) throw new ForbiddenException('Access denied');
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.empRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Employee email already in use');

    const employee = this.empRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone ?? null,
      jobTitle: dto.jobTitle ?? null,
      hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
      status: dto.status ?? EmployeeStatus.ACTIVE,
      salary: dto.salary ?? null,
      departmentId: dto.departmentId ?? null,
      userId: dto.userId ?? null,
    });
    return this.empRepo.save(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findById(id);

    if (dto.email && dto.email !== employee.email) {
      const existing = await this.empRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already in use');
      employee.email = dto.email;
    }

    if (dto.firstName    !== undefined) employee.firstName    = dto.firstName;
    if (dto.middleName   !== undefined) employee.middleName   = dto.middleName ?? null;
    if (dto.lastName     !== undefined) employee.lastName     = dto.lastName;
    if (dto.phone        !== undefined) employee.phone        = dto.phone ?? null;
    if (dto.jobTitle     !== undefined) employee.jobTitle     = dto.jobTitle ?? null;
    if (dto.birthDate    !== undefined) employee.birthDate    = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.hireDate     !== undefined) employee.hireDate     = dto.hireDate ? new Date(dto.hireDate) : null;
    if (dto.status       !== undefined) employee.status       = dto.status;
    if (dto.workType     !== undefined) employee.workType     = dto.workType ?? null;
    if (dto.salary       !== undefined) employee.salary       = dto.salary ?? null;
    if (dto.bonus        !== undefined) employee.bonus        = dto.bonus ?? null;
    if (dto.supervisorId !== undefined) employee.supervisorId = dto.supervisorId ?? null;
    if (dto.departmentId !== undefined) employee.departmentId = dto.departmentId ?? null;
    if (dto.userId       !== undefined) employee.userId       = dto.userId ?? null;

    return this.empRepo.save(employee);
  }

  async terminate(id: string): Promise<Employee> {
    const employee = await this.findById(id);
    employee.status = EmployeeStatus.TERMINATED;
    employee.terminationDate = new Date();
    return this.empRepo.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findById(id);
    await this.empRepo.remove(employee);
  }
}

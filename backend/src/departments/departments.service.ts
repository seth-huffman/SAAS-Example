import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.deptRepo.find({
      relations: { manager: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Department> {
    const dept = await this.deptRepo.findOne({ where: { id }, relations: { manager: true } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async getMembers(id: string, pagination: PaginationDto) {
    await this.findById(id);
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.empRepo.findAndCount({
      where: { departmentId: id },
      order: { lastName: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit };
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const existing = await this.deptRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Department name already exists');

    const dept = this.deptRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      managerId: dto.managerId ?? null,
    });
    return this.deptRepo.save(dept);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const dept = await this.findById(id);
    if (dto.name && dto.name !== dept.name) {
      const existing = await this.deptRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Department name already exists');
      dept.name = dto.name;
    }
    if (dto.description !== undefined) dept.description = dto.description ?? null;
    if (dto.managerId !== undefined) dept.managerId = dto.managerId ?? null;
    return this.deptRepo.save(dept);
  }

  async remove(id: string): Promise<void> {
    const dept = await this.findById(id);
    await this.deptRepo.remove(dept);
  }
}

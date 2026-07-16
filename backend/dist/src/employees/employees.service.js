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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("./entities/employee.entity");
const user_entity_1 = require("../users/entities/user.entity");
let EmployeesService = class EmployeesService {
    empRepo;
    constructor(empRepo) {
        this.empRepo = empRepo;
    }
    async findAll(filters) {
        const { search, status, departmentId, page = 1, limit = 20 } = filters;
        const qb = this.empRepo
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.department', 'dept')
            .leftJoinAndSelect('e.supervisor', 'supervisor')
            .orderBy('e.lastName', 'ASC')
            .take(limit)
            .skip((page - 1) * limit);
        if (search) {
            qb.andWhere('(LOWER(e.firstName) LIKE :s OR LOWER(e.lastName) LIKE :s OR LOWER(e.email) LIKE :s)', { s: `%${search.toLowerCase()}%` });
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
    async findMe(userId) {
        const employee = await this.empRepo.findOne({
            where: { userId },
            relations: { department: true, user: true, supervisor: true },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee record not found for this account');
        return employee;
    }
    async findById(id, requestUser) {
        const employee = await this.empRepo.findOne({
            where: { id },
            relations: { department: true, user: true, supervisor: true },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (requestUser?.role === user_entity_1.UserRole.EMPLOYEE) {
            const emp = await this.empRepo.findOne({ where: { userId: requestUser.userId } });
            if (!emp || emp.id !== id)
                throw new common_1.ForbiddenException('Access denied');
        }
        return employee;
    }
    async create(dto) {
        const existing = await this.empRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Employee email already in use');
        const employee = this.empRepo.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone ?? null,
            jobTitle: dto.jobTitle ?? null,
            hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
            status: dto.status ?? employee_entity_1.EmployeeStatus.ACTIVE,
            salary: dto.salary ?? null,
            departmentId: dto.departmentId ?? null,
            userId: dto.userId ?? null,
        });
        return this.empRepo.save(employee);
    }
    async update(id, dto) {
        const employee = await this.findById(id);
        if (dto.email && dto.email !== employee.email) {
            const existing = await this.empRepo.findOne({ where: { email: dto.email } });
            if (existing)
                throw new common_1.ConflictException('Email already in use');
            employee.email = dto.email;
        }
        if (dto.firstName !== undefined)
            employee.firstName = dto.firstName;
        if (dto.middleName !== undefined)
            employee.middleName = dto.middleName ?? null;
        if (dto.lastName !== undefined)
            employee.lastName = dto.lastName;
        if (dto.phone !== undefined)
            employee.phone = dto.phone ?? null;
        if (dto.jobTitle !== undefined)
            employee.jobTitle = dto.jobTitle ?? null;
        if (dto.birthDate !== undefined)
            employee.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
        if (dto.hireDate !== undefined)
            employee.hireDate = dto.hireDate ? new Date(dto.hireDate) : null;
        if (dto.status !== undefined)
            employee.status = dto.status;
        if (dto.workType !== undefined)
            employee.workType = dto.workType ?? null;
        if (dto.salary !== undefined)
            employee.salary = dto.salary ?? null;
        if (dto.bonus !== undefined)
            employee.bonus = dto.bonus ?? null;
        if (dto.supervisorId !== undefined)
            employee.supervisorId = dto.supervisorId ?? null;
        if (dto.departmentId !== undefined)
            employee.departmentId = dto.departmentId ?? null;
        if (dto.userId !== undefined)
            employee.userId = dto.userId ?? null;
        return this.empRepo.save(employee);
    }
    async terminate(id) {
        const employee = await this.findById(id);
        employee.status = employee_entity_1.EmployeeStatus.TERMINATED;
        employee.terminationDate = new Date();
        return this.empRepo.save(employee);
    }
    async remove(id) {
        const employee = await this.findById(id);
        await this.empRepo.remove(employee);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map
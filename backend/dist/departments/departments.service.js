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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("./entities/department.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
let DepartmentsService = class DepartmentsService {
    deptRepo;
    empRepo;
    constructor(deptRepo, empRepo) {
        this.deptRepo = deptRepo;
        this.empRepo = empRepo;
    }
    async findAll() {
        return this.deptRepo.find({
            relations: { manager: true },
            order: { name: 'ASC' },
        });
    }
    async findById(id) {
        const dept = await this.deptRepo.findOne({ where: { id }, relations: { manager: true } });
        if (!dept)
            throw new common_1.NotFoundException('Department not found');
        return dept;
    }
    async getMembers(id, pagination) {
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
    async create(dto) {
        const existing = await this.deptRepo.findOne({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException('Department name already exists');
        const dept = this.deptRepo.create({
            name: dto.name,
            description: dto.description ?? null,
            managerId: dto.managerId ?? null,
        });
        return this.deptRepo.save(dept);
    }
    async update(id, dto) {
        const dept = await this.findById(id);
        if (dto.name && dto.name !== dept.name) {
            const existing = await this.deptRepo.findOne({ where: { name: dto.name } });
            if (existing)
                throw new common_1.ConflictException('Department name already exists');
            dept.name = dto.name;
        }
        if (dto.description !== undefined)
            dept.description = dto.description ?? null;
        if (dto.managerId !== undefined)
            dept.managerId = dto.managerId ?? null;
        return this.deptRepo.save(dept);
    }
    async remove(id) {
        const dept = await this.findById(id);
        await this.deptRepo.remove(dept);
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map
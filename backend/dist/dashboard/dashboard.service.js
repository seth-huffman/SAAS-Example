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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../employees/entities/employee.entity");
const department_entity_1 = require("../departments/entities/department.entity");
const leave_request_entity_1 = require("../leave-requests/entities/leave-request.entity");
let DashboardService = class DashboardService {
    empRepo;
    deptRepo;
    leaveRepo;
    constructor(empRepo, deptRepo, leaveRepo) {
        this.empRepo = empRepo;
        this.deptRepo = deptRepo;
        this.leaveRepo = leaveRepo;
    }
    async getStats() {
        const [headcount, totalDepartments, pendingLeaves, recentHires, deptBreakdownRaw] = await Promise.all([
            this.empRepo.count({ where: { status: employee_entity_1.EmployeeStatus.ACTIVE } }),
            this.deptRepo.count(),
            this.leaveRepo.count({ where: { status: leave_request_entity_1.LeaveStatus.PENDING } }),
            this.empRepo.find({
                where: { status: employee_entity_1.EmployeeStatus.ACTIVE },
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
                .where('e.status = :status', { status: employee_entity_1.EmployeeStatus.ACTIVE })
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
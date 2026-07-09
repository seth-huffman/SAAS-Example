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
exports.PerformanceReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const performance_review_entity_1 = require("./entities/performance-review.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PerformanceReviewsService = class PerformanceReviewsService {
    reviewRepo;
    empRepo;
    constructor(reviewRepo, empRepo) {
        this.reviewRepo = reviewRepo;
        this.empRepo = empRepo;
    }
    async findAll(userId, role) {
        const qb = this.reviewRepo
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.employee', 'e')
            .orderBy('r.createdAt', 'DESC');
        if (role === user_entity_1.UserRole.EMPLOYEE) {
            const emp = await this.empRepo.findOne({ where: { userId } });
            if (!emp)
                return [];
            qb.where('r.employeeId = :empId', { empId: emp.id });
        }
        return qb.getMany();
    }
    async findById(id) {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: { employee: true },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return review;
    }
    async create(dto, userId) {
        const emp = await this.empRepo.findOne({ where: { userId } });
        if (!emp)
            throw new common_1.NotFoundException('No employee record linked to your account');
        const review = this.reviewRepo.create({
            employeeId: emp.id,
            reviewPeriod: dto.reviewPeriod,
            selfRating: dto.selfRating,
            selfComments: dto.selfComments,
            status: performance_review_entity_1.ReviewStatus.SUBMITTED,
        });
        return this.reviewRepo.save(review);
    }
    async update(id, dto) {
        const review = await this.findById(id);
        Object.assign(review, {
            ...(dto.managerRating !== undefined && { managerRating: dto.managerRating }),
            ...(dto.managerComments !== undefined && { managerComments: dto.managerComments }),
            ...(dto.status !== undefined && { status: dto.status }),
        });
        return this.reviewRepo.save(review);
    }
};
exports.PerformanceReviewsService = PerformanceReviewsService;
exports.PerformanceReviewsService = PerformanceReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(performance_review_entity_1.PerformanceReview)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PerformanceReviewsService);
//# sourceMappingURL=performance-reviews.service.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReview = exports.ReviewStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../../employees/entities/employee.entity");
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["SUBMITTED"] = "submitted";
    ReviewStatus["REVIEWED"] = "reviewed";
})(ReviewStatus || (exports.ReviewStatus = ReviewStatus = {}));
let PerformanceReview = class PerformanceReview {
    id;
    employeeId;
    employee;
    reviewPeriod;
    selfRating;
    selfComments;
    managerRating;
    managerComments;
    status;
    createdAt;
    updatedAt;
};
exports.PerformanceReview = PerformanceReview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PerformanceReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], PerformanceReview.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "selfRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "selfComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], PerformanceReview.prototype, "managerRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PerformanceReview.prototype, "managerComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.SUBMITTED }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "updatedAt", void 0);
exports.PerformanceReview = PerformanceReview = __decorate([
    (0, typeorm_1.Entity)('performance_reviews')
], PerformanceReview);
//# sourceMappingURL=performance-review.entity.js.map
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
exports.JobPosting = exports.WorkType = exports.PostingStatus = void 0;
const typeorm_1 = require("typeorm");
var PostingStatus;
(function (PostingStatus) {
    PostingStatus["OPEN"] = "open";
    PostingStatus["CLOSED"] = "closed";
})(PostingStatus || (exports.PostingStatus = PostingStatus = {}));
var WorkType;
(function (WorkType) {
    WorkType["ONSITE"] = "onsite";
    WorkType["HYBRID"] = "hybrid";
    WorkType["REMOTE"] = "remote";
})(WorkType || (exports.WorkType = WorkType = {}));
let JobPosting = class JobPosting {
    id;
    title;
    description;
    requirements;
    department;
    workType;
    salaryMin;
    salaryMax;
    status;
    createdById;
    createdAt;
    updatedAt;
};
exports.JobPosting = JobPosting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], JobPosting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], JobPosting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], JobPosting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], JobPosting.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar' }),
    __metadata("design:type", Object)
], JobPosting.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: WorkType, nullable: true }),
    __metadata("design:type", Object)
], JobPosting.prototype, "workType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], JobPosting.prototype, "salaryMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], JobPosting.prototype, "salaryMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PostingStatus, default: PostingStatus.OPEN }),
    __metadata("design:type", String)
], JobPosting.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'uuid' }),
    __metadata("design:type", Object)
], JobPosting.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], JobPosting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], JobPosting.prototype, "updatedAt", void 0);
exports.JobPosting = JobPosting = __decorate([
    (0, typeorm_1.Entity)('job_postings')
], JobPosting);
//# sourceMappingURL=job-posting.entity.js.map
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
exports.JobPostingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_posting_entity_1 = require("./entities/job-posting.entity");
const job_application_entity_1 = require("./entities/job-application.entity");
const user_entity_1 = require("../users/entities/user.entity");
let JobPostingsService = class JobPostingsService {
    repo;
    appRepo;
    constructor(repo, appRepo) {
        this.repo = repo;
        this.appRepo = appRepo;
    }
    async findAll(role) {
        const where = role === user_entity_1.UserRole.EMPLOYEE ? { status: job_posting_entity_1.PostingStatus.OPEN } : {};
        return this.repo.find({ where, order: { createdAt: 'DESC' } });
    }
    async findById(id) {
        const posting = await this.repo.findOne({ where: { id } });
        if (!posting)
            throw new common_1.NotFoundException('Job posting not found');
        return posting;
    }
    async create(dto, userId) {
        const posting = this.repo.create({
            title: dto.title,
            description: dto.description,
            requirements: dto.requirements ?? null,
            department: dto.department ?? null,
            workType: dto.workType ?? null,
            salaryMin: dto.salaryMin ?? null,
            salaryMax: dto.salaryMax ?? null,
            status: job_posting_entity_1.PostingStatus.OPEN,
            createdById: userId,
        });
        return this.repo.save(posting);
    }
    async update(id, dto) {
        const posting = await this.findById(id);
        Object.assign(posting, {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.requirements !== undefined && { requirements: dto.requirements }),
            ...(dto.department !== undefined && { department: dto.department }),
            ...(dto.workType !== undefined && { workType: dto.workType }),
            ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
            ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
            ...(dto.status !== undefined && { status: dto.status }),
        });
        return this.repo.save(posting);
    }
    async remove(id) {
        const posting = await this.findById(id);
        await this.repo.remove(posting);
    }
    async apply(jobPostingId, dto, userId) {
        const posting = await this.findById(jobPostingId);
        if (posting.status !== job_posting_entity_1.PostingStatus.OPEN) {
            throw new common_1.BadRequestException('This position is no longer accepting applications');
        }
        const application = this.appRepo.create({
            jobPostingId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            applicantEmail: dto.applicantEmail,
            phone: dto.phone ?? null,
            address: dto.address ?? null,
            workExperience: dto.workExperience ?? null,
            education: dto.education ?? null,
            resumeFileName: dto.resumeFileName ?? null,
            resumeData: dto.resumeData ?? null,
            coverLetter: dto.coverLetter ?? null,
            userId,
        });
        return this.appRepo.save(application);
    }
    async getApplications(jobPostingId) {
        return this.appRepo.find({
            where: { jobPostingId },
            order: { createdAt: 'DESC' },
        });
    }
    async getApplicationCount(jobPostingId) {
        return this.appRepo.count({ where: { jobPostingId } });
    }
};
exports.JobPostingsService = JobPostingsService;
exports.JobPostingsService = JobPostingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_posting_entity_1.JobPosting)),
    __param(1, (0, typeorm_1.InjectRepository)(job_application_entity_1.JobApplication)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], JobPostingsService);
//# sourceMappingURL=job-postings.service.js.map
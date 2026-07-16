"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const job_posting_entity_1 = require("./entities/job-posting.entity");
const job_application_entity_1 = require("./entities/job-application.entity");
const job_postings_service_1 = require("./job-postings.service");
const job_postings_controller_1 = require("./job-postings.controller");
let JobPostingsModule = class JobPostingsModule {
};
exports.JobPostingsModule = JobPostingsModule;
exports.JobPostingsModule = JobPostingsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([job_posting_entity_1.JobPosting, job_application_entity_1.JobApplication])],
        providers: [job_postings_service_1.JobPostingsService],
        controllers: [job_postings_controller_1.JobPostingsController],
        exports: [job_postings_service_1.JobPostingsService],
    })
], JobPostingsModule);
//# sourceMappingURL=job-postings.module.js.map
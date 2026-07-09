import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { ApplyJobPostingDto } from './dto/apply-job-posting.dto';
import { UserRole } from '../users/entities/user.entity';
interface AuthUser {
    userId: string;
    email: string;
    role: UserRole;
}
export declare class JobPostingsController {
    private readonly service;
    constructor(service: JobPostingsService);
    findAll(user: AuthUser): Promise<import("./entities/job-posting.entity").JobPosting[]>;
    findById(id: string): Promise<import("./entities/job-posting.entity").JobPosting>;
    create(dto: CreateJobPostingDto, user: AuthUser): Promise<import("./entities/job-posting.entity").JobPosting>;
    update(id: string, dto: UpdateJobPostingDto): Promise<import("./entities/job-posting.entity").JobPosting>;
    remove(id: string): Promise<void>;
    apply(id: string, dto: ApplyJobPostingDto, user: AuthUser): Promise<import("./entities/job-application.entity").JobApplication>;
    getApplications(id: string): Promise<import("./entities/job-application.entity").JobApplication[]>;
}
export {};

import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { ApplyJobPostingDto } from './dto/apply-job-posting.dto';
import { UserRole } from '../users/entities/user.entity';
export declare class JobPostingsService {
    private repo;
    private appRepo;
    constructor(repo: Repository<JobPosting>, appRepo: Repository<JobApplication>);
    findAll(role: UserRole): Promise<JobPosting[]>;
    findById(id: string): Promise<JobPosting>;
    create(dto: CreateJobPostingDto, userId: string): Promise<JobPosting>;
    update(id: string, dto: UpdateJobPostingDto): Promise<JobPosting>;
    remove(id: string): Promise<void>;
    apply(jobPostingId: string, dto: ApplyJobPostingDto, userId: string | null): Promise<JobApplication>;
    getApplications(jobPostingId: string): Promise<JobApplication[]>;
    getApplicationCount(jobPostingId: string): Promise<number>;
}

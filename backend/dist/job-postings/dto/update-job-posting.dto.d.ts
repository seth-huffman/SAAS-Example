import { PostingStatus } from '../entities/job-posting.entity';
export declare class UpdateJobPostingDto {
    title?: string;
    description?: string;
    requirements?: string;
    department?: string;
    salaryMin?: number;
    salaryMax?: number;
    status?: PostingStatus;
}

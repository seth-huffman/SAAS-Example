import { PostingStatus, WorkType } from '../entities/job-posting.entity';
export declare class UpdateJobPostingDto {
    title?: string;
    description?: string;
    requirements?: string;
    department?: string;
    workType?: WorkType;
    salaryMin?: number;
    salaryMax?: number;
    status?: PostingStatus;
}

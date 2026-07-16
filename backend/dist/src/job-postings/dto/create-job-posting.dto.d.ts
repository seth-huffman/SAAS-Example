import { WorkType } from '../entities/job-posting.entity';
export declare class CreateJobPostingDto {
    title: string;
    description: string;
    requirements?: string;
    department?: string;
    workType?: WorkType;
    salaryMin?: number;
    salaryMax?: number;
}

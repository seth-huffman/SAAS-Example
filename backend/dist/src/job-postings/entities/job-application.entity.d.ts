import { JobPosting } from './job-posting.entity';
export interface WorkExperience {
    company: string;
    jobTitle: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}
export interface Education {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
}
export declare class JobApplication {
    id: string;
    jobPostingId: string;
    jobPosting: JobPosting;
    firstName: string | null;
    lastName: string | null;
    applicantEmail: string;
    phone: string | null;
    address: string | null;
    workExperience: WorkExperience[] | null;
    education: Education[] | null;
    resumeFileName: string | null;
    resumeData: string | null;
    coverLetter: string | null;
    userId: string | null;
    createdAt: Date;
}

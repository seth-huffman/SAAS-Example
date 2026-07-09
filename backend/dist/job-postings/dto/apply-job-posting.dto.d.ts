export declare class WorkExperienceDto {
    company: string;
    jobTitle: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}
export declare class EducationDto {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
}
export declare class ApplyJobPostingDto {
    firstName: string;
    lastName: string;
    applicantEmail: string;
    phone?: string;
    address?: string;
    workExperience?: WorkExperienceDto[];
    education?: EducationDto[];
    resumeFileName?: string;
    resumeData?: string;
    coverLetter?: string;
}

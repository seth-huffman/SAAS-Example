export declare enum PostingStatus {
    OPEN = "open",
    CLOSED = "closed"
}
export declare class JobPosting {
    id: string;
    title: string;
    description: string;
    requirements: string | null;
    department: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    status: PostingStatus;
    createdById: string | null;
    createdAt: Date;
    updatedAt: Date;
}

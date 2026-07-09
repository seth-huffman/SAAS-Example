import { Employee } from '../../employees/entities/employee.entity';
export declare enum ReviewStatus {
    SUBMITTED = "submitted",
    REVIEWED = "reviewed"
}
export declare class PerformanceReview {
    id: string;
    employeeId: string;
    employee: Employee;
    reviewPeriod: string;
    selfRating: number;
    selfComments: string;
    managerRating: number | null;
    managerComments: string | null;
    status: ReviewStatus;
    createdAt: Date;
    updatedAt: Date;
}

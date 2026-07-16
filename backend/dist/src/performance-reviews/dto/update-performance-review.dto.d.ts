import { ReviewStatus } from '../entities/performance-review.entity';
export declare class UpdatePerformanceReviewDto {
    managerRating?: number;
    managerComments?: string;
    status?: ReviewStatus;
}

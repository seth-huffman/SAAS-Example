import { PerformanceReviewsService } from './performance-reviews.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { UserRole } from '../users/entities/user.entity';
interface AuthUser {
    userId: string;
    email: string;
    role: UserRole;
}
export declare class PerformanceReviewsController {
    private readonly service;
    constructor(service: PerformanceReviewsService);
    findAll(user: AuthUser): Promise<import("./entities/performance-review.entity").PerformanceReview[]>;
    findById(id: string): Promise<import("./entities/performance-review.entity").PerformanceReview>;
    create(dto: CreatePerformanceReviewDto, user: AuthUser): Promise<import("./entities/performance-review.entity").PerformanceReview>;
    update(id: string, dto: UpdatePerformanceReviewDto): Promise<import("./entities/performance-review.entity").PerformanceReview>;
}
export {};

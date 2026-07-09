import { Repository } from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { UserRole } from '../users/entities/user.entity';
export declare class PerformanceReviewsService {
    private reviewRepo;
    private empRepo;
    constructor(reviewRepo: Repository<PerformanceReview>, empRepo: Repository<Employee>);
    findAll(userId: string, role: UserRole): Promise<PerformanceReview[]>;
    findById(id: string): Promise<PerformanceReview>;
    create(dto: CreatePerformanceReviewDto, userId: string): Promise<PerformanceReview>;
    update(id: string, dto: UpdatePerformanceReviewDto): Promise<PerformanceReview>;
}

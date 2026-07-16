import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceReview, ReviewStatus } from './entities/performance-review.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { UpdateSelfReviewDto } from './dto/update-self-review.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class PerformanceReviewsService {
  constructor(
    @InjectRepository(PerformanceReview) private reviewRepo: Repository<PerformanceReview>,
    @InjectRepository(Employee)          private empRepo:    Repository<Employee>,
  ) {}

  async findAll(userId: string, role: UserRole): Promise<PerformanceReview[]> {
    const qb = this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.employee', 'e')
      .orderBy('r.createdAt', 'DESC');

    if (role === UserRole.EMPLOYEE) {
      const emp = await this.empRepo.findOne({ where: { userId } });
      if (!emp) return [];
      qb.where('r.employeeId = :empId', { empId: emp.id });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<PerformanceReview> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: { employee: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async create(dto: CreatePerformanceReviewDto, userId: string): Promise<PerformanceReview> {
    const emp = await this.empRepo.findOne({ where: { userId } });
    if (!emp) throw new NotFoundException('No employee record linked to your account');

    const review = this.reviewRepo.create({
      employeeId: emp.id,
      reviewPeriod: dto.reviewPeriod,
      selfRating: dto.selfRating,
      selfComments: dto.selfComments,
      status: ReviewStatus.SUBMITTED,
    });
    return this.reviewRepo.save(review);
  }

  async update(id: string, dto: UpdatePerformanceReviewDto): Promise<PerformanceReview> {
    const review = await this.findById(id);
    Object.assign(review, {
      ...(dto.managerRating   !== undefined && { managerRating:   dto.managerRating   }),
      ...(dto.managerComments !== undefined && { managerComments: dto.managerComments }),
      ...(dto.status          !== undefined && { status:          dto.status          }),
    });
    return this.reviewRepo.save(review);
  }

  async deleteSelf(id: string, userId: string): Promise<void> {
    const review = await this.findById(id);
    const emp = await this.empRepo.findOne({ where: { userId } });
    if (!emp || review.employeeId !== emp.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    if (review.status !== ReviewStatus.SUBMITTED) {
      throw new ForbiddenException('Cannot delete a review that has already been approved');
    }
    await this.reviewRepo.remove(review);
  }

  async updateSelf(id: string, dto: UpdateSelfReviewDto, userId: string): Promise<PerformanceReview> {
    const review = await this.findById(id);

    const emp = await this.empRepo.findOne({ where: { userId } });
    if (!emp || review.employeeId !== emp.id) {
      throw new ForbiddenException('You can only edit your own reviews');
    }
    if (review.status !== ReviewStatus.SUBMITTED) {
      throw new ForbiddenException('Cannot edit a review that has already been reviewed by a manager');
    }

    if (dto.reviewPeriod !== undefined) review.reviewPeriod = dto.reviewPeriod;
    if (dto.selfRating   !== undefined) review.selfRating   = dto.selfRating;
    if (dto.selfComments !== undefined) review.selfComments = dto.selfComments;

    return this.reviewRepo.save(review);
  }
}

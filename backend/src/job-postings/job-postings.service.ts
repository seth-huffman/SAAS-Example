import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, PostingStatus } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { ApplyJobPostingDto } from './dto/apply-job-posting.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class JobPostingsService {
  constructor(
    @InjectRepository(JobPosting)    private repo:    Repository<JobPosting>,
    @InjectRepository(JobApplication) private appRepo: Repository<JobApplication>,
  ) {}

  async findAll(role: UserRole): Promise<JobPosting[]> {
    const where = role === UserRole.EMPLOYEE ? { status: PostingStatus.OPEN } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<JobPosting> {
    const posting = await this.repo.findOne({ where: { id } });
    if (!posting) throw new NotFoundException('Job posting not found');
    return posting;
  }

  async create(dto: CreateJobPostingDto, userId: string): Promise<JobPosting> {
    const posting = this.repo.create({
      title:        dto.title,
      description:  dto.description,
      requirements: dto.requirements ?? null,
      department:   dto.department   ?? null,
      salaryMin:    dto.salaryMin    ?? null,
      salaryMax:    dto.salaryMax    ?? null,
      status:       PostingStatus.OPEN,
      createdById:  userId,
    });
    return this.repo.save(posting);
  }

  async update(id: string, dto: UpdateJobPostingDto): Promise<JobPosting> {
    const posting = await this.findById(id);
    Object.assign(posting, {
      ...(dto.title        !== undefined && { title:        dto.title        }),
      ...(dto.description  !== undefined && { description:  dto.description  }),
      ...(dto.requirements !== undefined && { requirements: dto.requirements }),
      ...(dto.department   !== undefined && { department:   dto.department   }),
      ...(dto.salaryMin    !== undefined && { salaryMin:    dto.salaryMin    }),
      ...(dto.salaryMax    !== undefined && { salaryMax:    dto.salaryMax    }),
      ...(dto.status       !== undefined && { status:       dto.status       }),
    });
    return this.repo.save(posting);
  }

  async remove(id: string): Promise<void> {
    const posting = await this.findById(id);
    await this.repo.remove(posting);
  }

  async apply(jobPostingId: string, dto: ApplyJobPostingDto, userId: string | null): Promise<JobApplication> {
    const posting = await this.findById(jobPostingId);
    if (posting.status !== PostingStatus.OPEN) {
      throw new BadRequestException('This position is no longer accepting applications');
    }
    const application = this.appRepo.create({
      jobPostingId,
      firstName:      dto.firstName,
      lastName:       dto.lastName,
      applicantEmail: dto.applicantEmail,
      phone:          dto.phone          ?? null,
      address:        dto.address        ?? null,
      workExperience: dto.workExperience ?? null,
      education:      dto.education      ?? null,
      resumeFileName: dto.resumeFileName ?? null,
      resumeData:     dto.resumeData     ?? null,
      coverLetter:    dto.coverLetter    ?? null,
      userId,
    });
    return this.appRepo.save(application);
  }

  async getApplications(jobPostingId: string): Promise<JobApplication[]> {
    return this.appRepo.find({
      where: { jobPostingId },
      order: { createdAt: 'DESC' },
    });
  }

  async getApplicationCount(jobPostingId: string): Promise<number> {
    return this.appRepo.count({ where: { jobPostingId } });
  }
}

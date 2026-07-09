import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsController } from './job-postings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting, JobApplication])],
  providers: [JobPostingsService],
  controllers: [JobPostingsController],
  exports: [JobPostingsService],
})
export class JobPostingsModule {}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  jobPostingId: string;

  @ManyToOne(() => JobPosting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPosting;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar' })
  applicantEmail: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'simple-json', nullable: true })
  workExperience: WorkExperience[] | null;

  @Column({ type: 'simple-json', nullable: true })
  education: Education[] | null;

  @Column({ type: 'varchar', nullable: true })
  resumeFileName: string | null;

  @Column({ type: 'text', nullable: true })
  resumeData: string | null;

  @Column({ type: 'text', nullable: true })
  coverLetter: string | null;

  @Column({ nullable: true, type: 'uuid' })
  userId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

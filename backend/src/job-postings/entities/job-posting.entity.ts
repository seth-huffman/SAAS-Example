import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PostingStatus {
  OPEN   = 'open',
  CLOSED = 'closed',
}

export enum WorkType {
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
  REMOTE = 'remote',
}

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({ nullable: true, type: 'varchar' })
  department: string | null;

  @Column({ type: 'enum', enum: WorkType, nullable: true })
  workType: WorkType | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMin: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMax: number | null;

  @Column({ type: 'enum', enum: PostingStatus, default: PostingStatus.OPEN })
  status: PostingStatus;

  @Column({ nullable: true, type: 'uuid' })
  createdById: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

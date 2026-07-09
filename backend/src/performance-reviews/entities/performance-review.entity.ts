import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum ReviewStatus {
  SUBMITTED = 'submitted',
  REVIEWED   = 'reviewed',
}

@Entity('performance_reviews')
export class PerformanceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  reviewPeriod: string;

  @Column({ type: 'int' })
  selfRating: number;

  @Column({ type: 'text' })
  selfComments: string;

  @Column({ type: 'int', nullable: true })
  managerRating: number | null;

  @Column({ type: 'text', nullable: true })
  managerComments: string | null;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.SUBMITTED })
  status: ReviewStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

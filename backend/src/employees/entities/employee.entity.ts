import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { LeaveRequest } from '../../leave-requests/entities/leave-request.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
}

export enum WorkType {
  ONSITE  = 'onsite',
  HYBRID  = 'hybrid',
  REMOTE  = 'remote',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  middleName: string | null;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({ nullable: true, type: 'varchar' })
  jobTitle: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'date', nullable: true })
  hireDate: Date | null;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date | null;

  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @Column({ type: 'enum', enum: WorkType, nullable: true })
  workType: WorkType | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonus: number | null;

  @Column({ nullable: true, type: 'uuid' })
  supervisorId: string | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: Employee;

  @Column({ nullable: true, type: 'uuid' })
  departmentId: string | null;

  @ManyToOne(() => Department, (d) => d.employees, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true, type: 'uuid' })
  userId: string | null;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => LeaveRequest, (l) => l.employee)
  leaveRequests: LeaveRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

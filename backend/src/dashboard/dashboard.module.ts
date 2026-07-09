import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { LeaveRequest } from '../leave-requests/entities/leave-request.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, LeaveRequest])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}

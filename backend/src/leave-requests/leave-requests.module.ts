import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequestsController } from './leave-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, Employee])],
  providers: [LeaveRequestsService],
  controllers: [LeaveRequestsController],
})
export class LeaveRequestsModule {}

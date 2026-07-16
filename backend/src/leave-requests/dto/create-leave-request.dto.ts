import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HalfDayPeriod, LeaveType } from '../entities/leave-request.entity';

export class CreateLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Defaults to the requesting employee\'s own record' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-05' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @ApiPropertyOptional({ enum: HalfDayPeriod })
  @IsOptional()
  @IsEnum(HalfDayPeriod)
  halfDayPeriod?: HalfDayPeriod;

  @ApiPropertyOptional({ example: 4, description: 'Number of hours requested off' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursRequested?: number;
}

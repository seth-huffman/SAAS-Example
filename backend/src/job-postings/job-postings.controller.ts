import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { ApplyJobPostingDto } from './dto/apply-job-posting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

interface AuthUser { userId: string; email: string; role: UserRole; }

@ApiTags('Job Postings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('job-postings')
export class JobPostingsController {
  constructor(private readonly service: JobPostingsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.role);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  create(@Body() dto: CreateJobPostingDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateJobPostingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.CREATED)
  apply(@Param('id') id: string, @Body() dto: ApplyJobPostingDto, @CurrentUser() user: AuthUser) {
    return this.service.apply(id, dto, user.userId);
  }

  @Get(':id/applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  getApplications(@Param('id') id: string) {
    return this.service.getApplications(id);
  }
}

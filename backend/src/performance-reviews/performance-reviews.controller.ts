import { Controller, Delete, Get, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PerformanceReviewsService } from './performance-reviews.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { UpdateSelfReviewDto } from './dto/update-self-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

interface AuthUser { userId: string; email: string; role: UserRole; }

@ApiTags('Performance Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance-reviews')
export class PerformanceReviewsController {
  constructor(private readonly service: PerformanceReviewsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.userId, user.role);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePerformanceReviewDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSelf(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.deleteSelf(id, user.userId);
  }

  @Patch(':id/self')
  updateSelf(
    @Param('id') id: string,
    @Body() dto: UpdateSelfReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateSelf(id, dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdatePerformanceReviewDto) {
    return this.service.update(id, dto);
  }
}

import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSelfReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewPeriod?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  selfRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selfComments?: string;
}

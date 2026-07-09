import { IsInt, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePerformanceReviewDto {
  @ApiProperty({ description: 'e.g. "Q2 2026"' })
  @IsString()
  reviewPeriod: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  selfRating: number;

  @ApiProperty()
  @IsString()
  selfComments: string;
}

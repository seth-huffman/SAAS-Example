import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WorkExperienceDto {
  @ApiProperty() @IsString() company: string;
  @ApiProperty() @IsString() jobTitle: string;
  @ApiProperty() @IsString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isCurrent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class EducationDto {
  @ApiProperty() @IsString() institution: string;
  @ApiProperty() @IsString() degree: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fieldOfStudy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
}

export class ApplyJobPostingDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;

  @ApiProperty() @IsEmail() applicantEmail: string;

  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional({ type: [WorkExperienceDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => WorkExperienceDto)
  workExperience?: WorkExperienceDto[];

  @ApiPropertyOptional({ type: [EducationDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EducationDto)
  education?: EducationDto[];

  @ApiPropertyOptional() @IsOptional() @IsString() resumeFileName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resumeData?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverLetter?: string;
}

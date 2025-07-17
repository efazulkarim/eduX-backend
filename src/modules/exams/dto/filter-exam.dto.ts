import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Medium, ExamType } from '../../../common/constants/status.constant';

export class FilterExamDto {
  @ApiProperty({ enum: Medium, description: 'Filter by medium', required: false })
  @IsEnum(Medium)
  @IsOptional()
  medium?: Medium;

  @ApiProperty({ description: 'Filter by class ID', required: false })
  @IsString()
  @IsOptional()
  classId?: string;

  @ApiProperty({ description: 'Filter by section ID', required: false })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiProperty({ description: 'Filter by subject ID', required: false })
  @IsString()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ enum: ExamType, description: 'Filter by exam type', required: false })
  @IsEnum(ExamType)
  @IsOptional()
  type?: ExamType;

  @ApiProperty({ description: 'Filter by teacher ID', required: false })
  @IsString()
  @IsOptional()
  teacherId?: string;
}
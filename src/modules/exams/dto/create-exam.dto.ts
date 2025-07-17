import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExamType } from '../../../common/constants/status.constant';

export class CreateExamDto {
  @ApiProperty({ description: 'Exam title', example: 'First Term Exam' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ExamType, description: 'Type of exam' })
  @IsEnum(ExamType)
  type: ExamType;

  @ApiProperty({ description: 'Exam description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Exam date', example: '2025-07-20T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Duration in minutes', example: 120 })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Total marks', example: 100 })
  @IsInt()
  @Min(1)
  totalMarks: number;

  @ApiProperty({ description: 'Pass marks', example: 40 })
  @IsInt()
  @Min(1)
  passMarks: number;

  @ApiProperty({ description: 'Class ID' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Section ID', required: false })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Teacher ID' })
  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class ExamListDto {
  @ApiProperty({ description: 'Exam ID' })
  @IsNumber()
  ExamID: number;

  @ApiProperty({ description: 'Exam Name' })
  @IsString()
  ExamName: string;

  @ApiProperty({ description: 'Custom Name', required: false })
  @IsOptional()
  @IsString()
  CustomName?: string;

  @ApiProperty({ description: 'Sequence number' })
  @IsNumber()
  Sequence: number;

  @ApiProperty({ description: 'Class ID' })
  @IsNumber()
  ClassID: number;

  @ApiProperty({ description: 'Medium ID' })
  @IsNumber()
  MediumID: number;

  @ApiProperty({ description: 'Is Active status' })
  @IsBoolean()
  IsActive: boolean;

  @ApiProperty({ description: 'Start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'End Date' })
  @IsDateString()
  EndDate: string;
}

export class UpdateExamListDto {
  @ApiProperty({ description: 'Custom Name', required: false })
  @IsOptional()
  @IsString()
  CustomName?: string;

  @ApiProperty({ description: 'Sequence number', required: false })
  @IsOptional()
  @IsNumber()
  Sequence?: number;

  @ApiProperty({ description: 'Is Active status (0 or 1)', required: false })
  @IsOptional()
  @IsNumber()
  IsActive?: number;

  @ApiProperty({ description: 'Start Date', required: false })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiProperty({ description: 'End Date', required: false })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}
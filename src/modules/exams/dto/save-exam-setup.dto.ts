import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ExamSetupItemDto {
  @ApiProperty({ description: 'Exam ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Is Active status (0 or 1)' })
  @IsOptional()
  isActive?: number;

  @ApiProperty({ description: 'Start Date', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: 'End Date', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: 'Custom Name', required: false })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({ description: 'Sequence number', required: false })
  @IsOptional()
  sequence?: number;
}

export class SaveExamSetupDto {
  @ApiProperty({ description: 'Class ID', required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ description: 'Medium', required: false })
  @IsOptional()
  @IsString()
  medium?: string;

  @ApiProperty({ description: 'Array of exam setup items', type: [ExamSetupItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSetupItemDto)
  exams: ExamSetupItemDto[];
}
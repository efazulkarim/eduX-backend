import { PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @ApiProperty({ description: 'Whether the exam is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
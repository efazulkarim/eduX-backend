import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, Medium } from '@prisma/client';
import { Shift } from '../../../common/constants/status.constant';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterStudentDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by medium',
    enum: Medium,
    example: 'BANGLA',
  })
  @IsOptional()
  @IsEnum(Medium)
  medium?: Medium;

  @ApiPropertyOptional({
    description: 'Filter by academic year',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    enum: Gender,
    example: 'MALE',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Filter by class ID',
    example: 'class-id-123',
  })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({
    description: 'Filter by section ID',
    example: 'section-id-123',
  })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiPropertyOptional({
    description: 'Search by student name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: 'true',
  })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional({
    description: 'Filter by shift',
    enum: Shift,
    example: 'MORNING',
  })
  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;
}
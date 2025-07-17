import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({
    description: 'Section name',
    example: 'A',
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Class ID this section belongs to',
    example: 'class-cuid-123',
  })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
    description: 'Department ID (optional)',
    example: 'department-cuid-456',
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;



  @ApiProperty({
    description: 'Maximum capacity of students in this section',
    example: 30,
    minimum: 1,
    maximum: 100,
    default: 30,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  capacity?: number = 30;
}

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Science',
    enum: [
      'Science',
      'Business Studies',
      'Humanities',
      'Vocational - General Mechanics',
      'Vocational - Electrical',
      'Vocational',
      'B.S.S',
    ],
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Department description',
    example: 'Science department',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

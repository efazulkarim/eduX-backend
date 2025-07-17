import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, Shift } from '../../../common/constants/status.constant';
import { Medium } from '@prisma/client';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Roll number', example: '001', required: false })
  @IsString()
  @IsOptional()
  rollNumber?: string;

  @ApiProperty({ description: 'Admission number', example: 'ADM001', required: false })
  @IsString()
  @IsOptional()
  admissionNo?: string;

  @ApiProperty({ description: 'Date of birth', example: '2010-05-15', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ enum: Gender, description: 'Gender', required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ description: 'Address', example: '123 Street, City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Father name', example: 'John Doe Sr.', required: false })
  @IsString()
  @IsOptional()
  fatherName?: string;

  @ApiProperty({ description: 'Mother name', example: 'Jane Doe', required: false })
  @IsString()
  @IsOptional()
  motherName?: string;

  @ApiProperty({ description: 'Parent phone', example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiProperty({
    description: 'Parent email',
    required: false,
    example: 'parent@example.com',
  })
  @IsString()
  @IsOptional()
  parentEmail?: string;

  @ApiProperty({ description: 'Blood group', required: false, example: 'O+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiProperty({ enum: Medium, description: 'Medium of instruction', required: false })
  @IsEnum(Medium)
  @IsOptional()
  medium?: Medium;

  @ApiProperty({ description: 'Academic year', required: false, example: '2024' })
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiProperty({ enum: Shift, description: 'School shift', required: false })
  @IsEnum(Shift)
  @IsOptional()
  shift?: Shift;

  @ApiProperty({
    description: 'Section ID',
    required: false,
    example: 'sectionCuid',
  })
  @IsString()
  @IsOptional()
  sectionId?: string;
}

import { PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsOptional, IsString, IsEmail, IsEnum, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiPropertyOptional({
    description: 'Teacher email address',
    example: 'teacher@school.edu',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Teacher password',
    example: 'NewSecurePassword123!',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    example: UserRole.TEACHER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Teacher first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Teacher last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Teacher phone number',
    example: '+8801712345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Unique employee ID',
    example: 'TCH001',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1985-05-15',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Teacher address',
    example: '123 Main Street, Dhaka, Bangladesh',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Teacher qualification',
    example: 'M.Sc in Mathematics',
  })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  experience?: number;

  @ApiPropertyOptional({
    description: 'Monthly salary',
    example: 50000.00,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  salary?: number;

  @ApiPropertyOptional({
    description: 'Joining date',
    example: '2023-01-15',
  })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
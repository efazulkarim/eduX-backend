import { IsString, IsEmail, IsEnum, IsDateString, IsNumber, IsDecimal, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateTeacherDto {
  // User fields
  @ApiProperty({
    description: 'Teacher email address',
    example: 'teacher@school.edu',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Teacher password',
    example: 'SecurePassword123!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.TEACHER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Teacher first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Teacher last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Teacher phone number',
    example: '+8801712345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // Teacher specific fields
  @ApiProperty({
    description: 'Unique employee ID',
    example: 'TCH001',
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1985-05-15',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Teacher address',
    example: '123 Main Street, Dhaka, Bangladesh',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Teacher qualification',
    example: 'M.Sc in Mathematics',
  })
  @IsString()
  qualification: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  experience: number;

  @ApiProperty({
    description: 'Monthly salary',
    example: 50000.00,
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  salary: number;

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
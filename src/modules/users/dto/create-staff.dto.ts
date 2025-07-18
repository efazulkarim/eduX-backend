import { IsOptional, IsString, IsEmail, IsEnum, IsDateString, IsBoolean, ValidateNested, IsArray, IsNumber, IsDecimal } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender, Medium, Shift, StaffRole } from '@prisma/client';

export class CreateStaffEducationDto {
  @ApiProperty({
    description: 'Examination name',
    example: 'Bachelor of Science',
  })
  @IsString()
  exam: string;

  @ApiProperty({
    description: 'Educational institute name',
    example: 'University of Dhaka',
  })
  @IsString()
  institute: string;

  @ApiPropertyOptional({
    description: 'Grade Point Average',
    example: '3.75',
  })
  @IsOptional()
  @IsString()
  gpa?: string;

  @ApiPropertyOptional({
    description: 'Grade obtained',
    example: 'A+',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    description: 'Year of passing',
    example: '2020',
  })
  @IsOptional()
  @IsString()
  passingYear?: string;

  @ApiPropertyOptional({
    description: 'Education board',
    example: 'Dhaka Board',
  })
  @IsOptional()
  @IsString()
  board?: string;

  @ApiPropertyOptional({
    description: 'Duration of course',
    example: '4 years',
  })
  @IsOptional()
  @IsString()
  duration?: string;
}

export class CreateStaffExperienceDto {
  @ApiProperty({
    description: 'Job designation/position',
    example: 'Senior Teacher',
  })
  @IsString()
  designation: string;

  @ApiProperty({
    description: 'Organization name',
    example: 'ABC High School',
  })
  @IsString()
  organization: string;

  @ApiPropertyOptional({
    description: 'Organization address',
    example: 'Dhaka, Bangladesh',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Duration of employment',
    example: '2 years',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Employment start date',
    example: '2020-01-15',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Employment end date',
    example: '2022-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateStaffDto {
  // User fields
  @ApiProperty({
    description: 'Staff email address',
    example: 'john.doe@school.edu',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Staff password (optional since auth is disabled)',
    example: 'SecurePassword123!',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.TEACHER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+8801712345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // Staff specific fields
  @ApiProperty({
    description: 'Employee ID',
    example: 'EMP001',
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Staff role/type',
    enum: StaffRole,
    example: StaffRole.TEACHER,
  })
  @IsEnum(StaffRole)
  staffRole: StaffRole;

  @ApiPropertyOptional({
    description: 'ID number',
    example: 'ID123456',
  })
  @IsOptional()
  @IsString()
  idNo?: string;

  @ApiPropertyOptional({
    description: 'HF ID',
    example: 'HF001',
  })
  @IsOptional()
  @IsString()
  hfId?: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-05-15',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Joining date',
    example: '2023-01-15',
  })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional({
    description: 'Blood group',
    example: 'A+',
  })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Religion',
    example: 'Islam',
  })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({
    description: 'Medium of instruction',
    enum: Medium,
    example: Medium.ENGLISH,
  })
  @IsOptional()
  @IsEnum(Medium)
  medium?: Medium;

  @ApiPropertyOptional({
    description: 'Department',
    example: 'Science',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Job designation/position',
    example: 'Senior Mathematics Teacher',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Work shift',
    enum: Shift,
    example: Shift.MORNING,
  })
  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;

  @ApiPropertyOptional({
    description: 'National ID number',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  nid?: string;

  @ApiPropertyOptional({
    description: 'Birth certificate number',
    example: 'BC123456789',
  })
  @IsOptional()
  @IsString()
  birthCertNo?: string;

  @ApiPropertyOptional({
    description: 'Serial number',
    example: 'SN001',
  })
  @IsOptional()
  @IsString()
  serialNo?: string;

  @ApiPropertyOptional({
    description: 'Present address',
    example: '123 Main Street, Dhaka, Bangladesh',
  })
  @IsOptional()
  @IsString()
  presentAddress?: string;

  @ApiPropertyOptional({
    description: 'Permanent address',
    example: '456 Village Road, Chittagong, Bangladesh',
  })
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Teacher-specific fields (optional for non-teacher staff)
  @ApiPropertyOptional({
    description: 'Educational qualification (for teachers)',
    example: 'Master of Science in Mathematics',
  })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({
    description: 'Years of experience (for teachers)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  experience?: number;

  @ApiPropertyOptional({
    description: 'Monthly salary (for teachers)',
    example: 50000.00,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  salary?: number;

  @ApiPropertyOptional({
    description: 'Address (for teachers)',
    example: '123 Teacher Street, Dhaka, Bangladesh',
  })
  @IsOptional()
  @IsString()
  address?: string;

  // Education and Experience (optional)
  @ApiPropertyOptional({
    description: 'Educational background',
    type: [CreateStaffEducationDto],
    example: [{
      exam: 'Bachelor of Science',
      institute: 'University of Dhaka',
      gpa: '3.75',
      grade: 'A+',
      passingYear: '2020',
      board: 'Dhaka Board',
      duration: '4 years'
    }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStaffEducationDto)
  educations?: CreateStaffEducationDto[];

  @ApiPropertyOptional({
    description: 'Work experience',
    type: [CreateStaffExperienceDto],
    example: [{
      designation: 'Senior Teacher',
      organization: 'ABC High School',
      address: 'Dhaka, Bangladesh',
      duration: '2 years',
      startDate: '2020-01-15',
      endDate: '2022-12-31'
    }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStaffExperienceDto)
  experiences?: CreateStaffExperienceDto[];
}
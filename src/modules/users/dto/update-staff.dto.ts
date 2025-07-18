import { IsOptional, IsString, ValidateNested, IsArray, IsDateString, IsEmail, IsEnum, IsBoolean, IsNumber, IsDecimal } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender, Medium, Shift, StaffRole } from '@prisma/client';

export class UpdateStaffEducationDto {
  @ApiPropertyOptional({
    description: 'Education record ID (for updates)',
    example: 'edu_123456',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: 'Examination name',
    example: 'Bachelor of Science',
  })
  @IsOptional()
  @IsString()
  exam?: string;

  @ApiPropertyOptional({
    description: 'Educational institute name',
    example: 'University of Dhaka',
  })
  @IsOptional()
  @IsString()
  institute?: string;

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

export class UpdateStaffExperienceDto {
  @ApiPropertyOptional({
    description: 'Experience record ID (for updates)',
    example: 'exp_123456',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: 'Job designation/position',
    example: 'Senior Teacher',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Organization name',
    example: 'ABC High School',
  })
  @IsOptional()
  @IsString()
  organization?: string;

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

export class UpdateStaffDto {
  // User fields
  @ApiPropertyOptional({
    description: 'Staff email address',
    example: 'john.doe@school.edu',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Staff password',
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
    description: 'First name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+8801712345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // Staff specific fields
  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'EMP001',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

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
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // New unified staff fields
  @ApiPropertyOptional({
    description: 'Staff role',
    enum: StaffRole,
    example: StaffRole.TEACHER,
  })
  @IsOptional()
  @IsEnum(StaffRole)
  staffRole?: StaffRole;

  @ApiPropertyOptional({
    description: 'Educational qualification',
    example: 'Masters in Education',
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
    description: 'Address',
    example: '123 Teacher Street, Dhaka',
  })
  @IsOptional()
  @IsString()
  address?: string;

  // Education and Experience (optional)
  @ApiPropertyOptional({
    description: 'Educational background (provide only records to update/add)',
    type: [UpdateStaffEducationDto],
    example: [{
      id: 'edu_123456', // Include ID for updates, omit for new records
      exam: 'Master of Science',
      institute: 'University of Dhaka',
      gpa: '3.85',
      grade: 'A+',
      passingYear: '2022',
      board: 'Dhaka Board',
      duration: '2 years'
    }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStaffEducationDto)
  educations?: UpdateStaffEducationDto[];

  @ApiPropertyOptional({
    description: 'Work experience (provide only records to update/add)',
    type: [UpdateStaffExperienceDto],
    example: [{
      id: 'exp_123456', // Include ID for updates, omit for new records
      designation: 'Head Teacher',
      organization: 'XYZ High School',
      address: 'Chittagong, Bangladesh',
      duration: '3 years',
      startDate: '2023-01-01',
      endDate: '2025-12-31'
    }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStaffExperienceDto)
  experiences?: UpdateStaffExperienceDto[];
}
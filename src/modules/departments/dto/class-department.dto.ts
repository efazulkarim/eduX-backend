import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ClassDepartmentConfigDto {
  @ApiProperty({ description: 'Department ID' })
  @IsString()
  departmentId: string;

  @ApiProperty({ description: 'Whether the department is active for this class' })
  @IsBoolean()
  isActive: boolean;
}

export class ClassDepartmentSetupDto {
  @ApiProperty({ description: 'Class ID' })
  @IsString()
  classId: string;

  @ApiProperty({
    description: 'Array of department configurations for the class',
    type: [ClassDepartmentConfigDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassDepartmentConfigDto)
  departments: ClassDepartmentConfigDto[];
}

export class ClassDepartmentResponseDto {
  @ApiProperty({ description: 'Class-Department relationship ID' })
  id: string;

  @ApiProperty({ description: 'Class ID' })
  classId: string;

  @ApiProperty({ description: 'Department ID' })
  departmentId: string;

  @ApiProperty({ description: 'Whether the department is active for this class' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Class details', required: false })
  class?: {
    id: string;
    name: string;
    medium: string;
  };

  @ApiProperty({ description: 'Department details', required: false })
  department?: {
    id: string;
    name: string;
    description?: string;
  };
}
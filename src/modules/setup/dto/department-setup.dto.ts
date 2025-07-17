import { IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DepartmentConfigDto {
  @ApiProperty({
    description: 'Department ID',
    example: 'cmd7ctabd000ev5m8349zryop',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Whether the department is active for this class',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class SaveDepartmentSetupDto {
  @ApiProperty({
    description: 'Class ID',
    example: 'cmd7ctab1000cv5m8eojh1au0',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: 'Array of department configurations',
    type: [DepartmentConfigDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentConfigDto)
  departments: DepartmentConfigDto[];
}
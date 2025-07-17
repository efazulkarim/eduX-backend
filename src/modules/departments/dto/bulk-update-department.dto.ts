import { IsArray, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateDepartmentDto {
  @ApiProperty({
    description: 'Array of department IDs to update',
    example: ['dept-id-1', 'dept-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  departmentIds: string[];

  @ApiProperty({
    description: 'Set active status for all specified departments',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class DepartmentSetupDto {
  @ApiProperty({
    description: 'Class ID to filter departments',
    example: 'class-id-123',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: 'Array of department configurations',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @IsArray()
  departmentConfigs: Array<{
    id: string;
    isActive: boolean;
  }>;
}

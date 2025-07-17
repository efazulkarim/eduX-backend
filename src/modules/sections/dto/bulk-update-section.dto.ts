import { IsArray, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateSectionDto {
  @ApiProperty({
    description: 'Array of section IDs to update',
    example: ['section-id-1', 'section-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  sectionIds: string[];

  @ApiProperty({
    description: 'Set active status for all specified sections',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SectionSetupDto {
  @ApiProperty({
    description: 'Class ID for section setup',
    example: 'class-id-123',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: 'Department ID for section setup (optional)',
    example: 'dept-id-456',
    required: false,
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: 'Array of section configurations',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        isActive: { type: 'boolean' },
        name: { type: 'string' },
      },
    },
  })
  @IsArray()
  sectionConfigs: Array<{
    id?: string;
    name: string;
    isActive: boolean;
  }>;
}

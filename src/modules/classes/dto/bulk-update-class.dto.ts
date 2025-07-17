import { IsArray, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateClassDto {
  @ApiProperty({
    description: 'Array of class IDs to update',
    example: ['class-id-1', 'class-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  classIds: string[];

  @ApiProperty({
    description: 'Set active status for all specified classes',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ClassSetupDto {
  @ApiProperty({
    description: 'Medium filter for class setup',
    example: 'BANGLA',
    required: false,
  })
  @IsString()
  @IsOptional()
  medium?: string;

  @ApiProperty({
    description: 'Array of class configurations',
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
  classConfigs: Array<{
    id: string;
    isActive: boolean;
  }>;
}

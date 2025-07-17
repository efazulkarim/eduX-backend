import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Medium {
  BANGLA = 'BANGLA',
  ENGLISH = 'ENGLISH',
}

export class CreateClassDto {
  @ApiProperty({
    description: 'Class name',
    example: 'Play',
    enum: [
      'Play',
      'Nursery',
      'KG',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
    ],
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Medium of instruction',
    enum: Medium,
    default: Medium.BANGLA,
  })
  @IsEnum(Medium)
  @IsOptional()
  medium?: Medium = Medium.BANGLA;
}

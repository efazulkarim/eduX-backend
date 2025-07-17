import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty()
  timestamp?: string;
}

export class PaginatedResponseDto<T> extends ResponseDto<T[]> {
  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

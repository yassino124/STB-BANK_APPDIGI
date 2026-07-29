import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class SortDto {
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

import { IsIn } from 'class-validator';

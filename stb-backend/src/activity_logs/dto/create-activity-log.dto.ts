import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateActivityLogDto {
  @IsString()
  employeeId: string;

  @IsString()
  action: string;

  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  changes?: any;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean;
}

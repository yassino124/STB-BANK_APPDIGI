import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  employeeId?: string; // Optional - extracted from JWT in controller

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  payload?: any;

  @IsOptional()
  @IsString()
  responseMessage?: string;
}

export class UpdateRequestStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  responseMessage?: string;
}

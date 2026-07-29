import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  payload?: any;

  @IsOptional()
  @IsString()
  responseMessage?: string;
}

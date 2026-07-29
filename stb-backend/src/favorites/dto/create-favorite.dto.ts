import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsString()
  referenceId: string;

  @IsOptional()
  referenceData?: any;

  @IsOptional()
  @IsString()
  label?: string;
}

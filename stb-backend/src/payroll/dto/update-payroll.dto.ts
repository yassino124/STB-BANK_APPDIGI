import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class UpdatePayrollDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  salaireBrut?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cnss?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  impot?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  prime?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  heuresSup?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  retenues?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaireNet?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

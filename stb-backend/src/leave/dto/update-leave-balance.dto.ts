import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class UpdateLeaveBalanceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  soldeAnnuel?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  soldeUtilise?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  soldeReporte?: number;

  @IsOptional()
  @IsInt()
  annee?: number;
}

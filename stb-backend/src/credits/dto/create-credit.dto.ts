import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateCreditDto {
  @IsString()
  employeeId: string;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1000)
  montantInitial: number;

  @IsInt()
  @Min(0)
  tauxInteret: number;

  @IsInt()
  @Min(1)
  nombreMois: number;

  @IsDateString()
  dateDebut: string;

  @IsOptional()
  @IsString()
  description?: string;
}

import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreatePrimeDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  montant: number;

  @IsOptional()
  @IsString()
  description?: string;
}

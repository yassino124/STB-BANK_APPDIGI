import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateCreditPaymentDto {
  @IsString()
  creditId: string;

  @IsString()
  employeeId: string;

  @IsInt()
  @Min(1)
  montant: number;

  @IsDateString()
  datePaiement: string;

  @IsOptional()
  @IsString()
  mode?: string;
}

import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  fromCurrency: string;

  @IsString()
  toCurrency: string;

  @IsInt()
  @Min(0)
  rate: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}

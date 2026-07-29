import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsNumber } from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(100)
  initialAmount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedReturn?: number;

  @IsString()
  riskLevel: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}

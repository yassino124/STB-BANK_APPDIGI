import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  employeeId: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  period: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  alertThreshold?: number;
}

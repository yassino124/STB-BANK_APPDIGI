import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateRechargeDto {
  @IsString()
  employeeId: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  operator: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}

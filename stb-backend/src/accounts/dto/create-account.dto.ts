import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  employeeId: string;

  @IsString()
  rib: string;

  @IsString()
  iban: string;

  @IsString()
  numCompte: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailyWithdrawalLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailyTransferLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyLimit?: number;
}

import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateQrPaymentDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsString()
  qrData: string;

  @IsString()
  expiresAt: string;

  @IsString()
  accountId: string;
}

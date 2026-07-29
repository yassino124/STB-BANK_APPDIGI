import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class CreateCardDto {
  @IsString()
  employeeId: string;

  @IsString()
  accountId: string;

  @IsString()
  cardNumber: string;

  @IsString()
  maskedNumber: string;

  @IsString()
  expiryDate: string;

  @IsString()
  cvvHash: string;

  @IsOptional()
  pinHash?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  limitQuotidien?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  limitMensuel?: number;

  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @IsOptional()
  @IsBoolean()
  contactlessEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  onlinePaymentsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalEnabled?: boolean;
}

import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  employeeId: string;

  @IsInt()
  montant: number;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  toAccountId?: string;

  @IsOptional()
  @IsString()
  cardId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

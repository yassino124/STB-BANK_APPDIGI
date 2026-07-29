import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateBillDto {
  @IsString()
  employeeId: string;

  @IsString()
  billerId: string;

  @IsString()
  billerName: string;

  @IsString()
  billType: string;

  @IsString()
  referenceNumber: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}

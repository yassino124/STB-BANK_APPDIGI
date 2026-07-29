import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdatePrimeStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;
}

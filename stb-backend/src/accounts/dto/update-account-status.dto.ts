import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateAccountStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

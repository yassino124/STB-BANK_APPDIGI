import { IsString, IsOptional } from 'class-validator';

export class CreateRiskAlertDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsString()
  severity: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  data?: any;
}

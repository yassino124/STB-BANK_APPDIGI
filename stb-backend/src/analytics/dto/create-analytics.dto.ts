import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateAnalyticsDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsString()
  metric: string;

  @IsInt()
  value: number;

  @IsOptional()
  dimensions?: any;

  @IsString()
  period: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

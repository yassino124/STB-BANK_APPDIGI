import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';

export class CreateFraudDetectionDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(0)
  @Max(100)
  riskScore: number;

  @IsOptional()
  @IsArray()
  factors?: string[];

  @IsOptional()
  details?: any;
}

import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  format: string;

  @IsOptional()
  parameters?: any;

  @IsString()
  generatedBy: string;
}

import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateCreditDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  montantRestant?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

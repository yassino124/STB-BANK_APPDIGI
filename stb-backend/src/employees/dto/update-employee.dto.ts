import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  poste?: string;

  @IsOptional()
  @IsString()
  departement?: string;

  @IsOptional()
  @IsString()
  agence?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  soldeConges?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

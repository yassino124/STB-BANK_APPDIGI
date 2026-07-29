import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class UpdateAuthorizationDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  heureDebut?: string;

  @IsOptional()
  @IsString()
  heureFin?: string;

  @IsOptional()
  @IsString()
  motif?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

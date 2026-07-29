import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateAuthorizationDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsDateString()
  date: string;

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
  commentaire?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

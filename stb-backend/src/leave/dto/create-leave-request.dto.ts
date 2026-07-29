import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;

  @IsInt()
  @Min(1)
  nombreJours: number;

  @IsOptional()
  @IsString()
  motif?: string;

  @IsOptional()
  @IsString()
  pieceJointe?: string;
}

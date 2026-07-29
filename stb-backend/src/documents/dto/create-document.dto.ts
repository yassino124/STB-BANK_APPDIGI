import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  employeeId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsInt()
  mois?: number;

  @IsOptional()
  @IsInt()
  annee?: number;

  @IsOptional()
  @IsBoolean()
  isSigned?: boolean;

  @IsOptional()
  @IsBoolean()
  isGenerated?: boolean;
}

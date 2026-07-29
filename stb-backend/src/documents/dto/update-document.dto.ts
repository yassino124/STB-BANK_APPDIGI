import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsBoolean()
  isSigned?: boolean;

  @IsOptional()
  @IsBoolean()
  isGenerated?: boolean;
}

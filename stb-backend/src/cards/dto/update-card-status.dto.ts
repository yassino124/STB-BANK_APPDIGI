import { IsString, IsOptional } from 'class-validator';

export class UpdateCardStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  freezeReason?: string;
}

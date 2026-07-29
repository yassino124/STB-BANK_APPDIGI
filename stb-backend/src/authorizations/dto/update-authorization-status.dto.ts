import { IsString, IsOptional } from 'class-validator';

export class UpdateAuthorizationStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  approverId?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

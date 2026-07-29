import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateLeaveStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

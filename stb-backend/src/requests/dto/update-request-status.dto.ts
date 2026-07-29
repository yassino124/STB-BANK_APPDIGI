import { IsString, IsOptional } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  responseMessage?: string;
}

import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  employeeId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  data?: any;
}

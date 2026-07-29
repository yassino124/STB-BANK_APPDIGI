import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  participants: string[];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  createdBy: string;
}

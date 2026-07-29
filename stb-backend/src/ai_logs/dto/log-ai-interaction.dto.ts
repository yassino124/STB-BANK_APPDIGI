import { IsString, IsOptional } from 'class-validator';

export class LogAiInteractionDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsString()
  sessionId: string;

  @IsString()
  prompt: string;

  @IsString()
  response: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  feedback?: string;
}

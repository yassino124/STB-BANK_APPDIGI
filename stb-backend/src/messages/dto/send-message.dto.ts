import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  senderId: string;

  @IsString()
  recipientId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  attachments?: any[];
}

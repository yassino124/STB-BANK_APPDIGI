import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../schemas/notification.schema';

export class SendNotificationDto {
  @ApiPropertyOptional({ description: 'ID de l\'employé. Si absent, envoie à tous les employés.' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ description: 'Titre de la notification' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Contenu du message' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ enum: NotificationType, description: 'Type de notification' })
  @IsEnum(NotificationType)
  type: NotificationType;
}

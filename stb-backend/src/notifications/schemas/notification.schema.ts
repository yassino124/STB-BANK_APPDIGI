import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  HR_REQUEST = 'HR_REQUEST',
  TRANSACTION = 'TRANSACTION',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  body: string;

  @Prop({ required: true, enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketMessageDocument = TicketMessage & Document;

export enum MessageSender {
  EMPLOYEE = 'EMPLOYEE',
  RH = 'RH',
  SYSTEM = 'SYSTEM',
}

@Schema({ timestamps: true, collection: 'ticket_messages' })
export class TicketMessage {
  @Prop({ type: Types.ObjectId, ref: 'Ticket', required: true, index: true })
  ticketId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true, enum: MessageSender })
  senderType: MessageSender;

  @Prop({ required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

// Indexes
TicketMessageSchema.index({ ticketId: 1, createdAt: 1 });
TicketMessageSchema.index({ senderId: 1 });

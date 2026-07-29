import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

export enum TicketType {
  ASSISTANCE = 'ASSISTANCE',
  RECLAMATION = 'RECLAMATION',
  BUG = 'BUG',
  FEEDBACK = 'FEEDBACK',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_RESPONSE = 'WAITING_RESPONSE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Schema({ timestamps: true, collection: 'tickets' })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: TicketType, default: TicketType.ASSISTANCE })
  type: TicketType;

  @Prop({ required: true, enum: TicketStatus, default: TicketStatus.OPEN, index: true })
  status: TicketStatus;

  @Prop({ required: true, enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  assignedTo: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  @Prop({ type: Date, default: null })
  closedAt: Date | null;

  @Prop({ type: Number, default: 0 })
  messageCount: number;

  @Prop({ type: Date, default: () => new Date() })
  lastMessageAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Indexes
TicketSchema.index({ employeeId: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ lastMessageAt: -1 });

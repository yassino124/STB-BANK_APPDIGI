import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  SUPPORT = 'SUPPORT',
  BROADCAST = 'BROADCAST',
}

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  @Prop({ required: true, enum: ConversationType, index: true })
  type: ConversationType;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Employee' }], required: true, index: true })
  participants: Types.ObjectId[];

  @Prop({ trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: Date, default: null, index: true })
  lastMessageAt: Date | null;

  @Prop({ default: '' })
  lastMessagePreview: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });
ConversationSchema.index({ type: 1, isActive: 1 });

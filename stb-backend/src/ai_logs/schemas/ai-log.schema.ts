import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiLogDocument = AiLog & Document;

@Schema({ timestamps: true, collection: 'ai_logs' })
export class AiLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee', index: true, default: null })
  employeeId: Types.ObjectId | null;

  @Prop({ required: true, trim: true, index: true })
  sessionId: string;

  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  response: string;

  @Prop({ default: 'gemini-2.0-flash' })
  model: string;

  @Prop({ type: Object, default: {} })
  context: Record<string, any>;

  @Prop({ default: 0 })
  tokensUsed: number;

  @Prop({ default: 0 })
  latency: number;

  @Prop({ default: true })
  success: boolean;

  @Prop({ trim: true })
  error: string;

  @Prop({ enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'], default: 'NEUTRAL' })
  feedback: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const AiLogSchema = SchemaFactory.createForClass(AiLog);
AiLogSchema.index({ employeeId: 1, createdAt: -1 });
AiLogSchema.index({ success: 1, createdAt: -1 });

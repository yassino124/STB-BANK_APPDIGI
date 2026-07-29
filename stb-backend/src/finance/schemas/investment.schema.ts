import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvestmentDocument = Investment & Document;

export enum InvestmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Investment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Number })
  expectedReturn: number;

  @Prop({ default: 0 })
  actualReturn: number;

  @Prop({ enum: InvestmentStatus, default: InvestmentStatus.PENDING })
  status: InvestmentStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  approvedBy: Types.ObjectId;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: '' })
  commentaire: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ employeeId: 1, status: 1 });
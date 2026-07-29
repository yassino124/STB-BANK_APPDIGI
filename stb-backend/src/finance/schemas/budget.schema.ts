import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BudgetDocument = Budget & Document;

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Budget extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ default: 0 })
  spent: number;

  @Prop({ default: 0 })
  savings: number;

  @Prop({ enum: BudgetStatus, default: BudgetStatus.DRAFT })
  status: BudgetStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  approvedBy: Types.ObjectId;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ default: '' })
  commentaire: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
BudgetSchema.index({ department: 1, status: 1 });
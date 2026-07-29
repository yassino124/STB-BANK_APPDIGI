import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RechargeDocument = Recharge & Document;

export enum Operator {
  ORANGE = 'ORANGE',
  TUNISIE_TELECOM = 'TUNISIE_TELECOM',
  OOREDOO = 'OOREDOO',
}

export enum RechargeStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'recharges' })
export class Recharge {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, enum: Operator, index: true })
  operator: Operator;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'TND', uppercase: true })
  currency: string;

  @Prop({ required: true, enum: RechargeStatus, default: RechargeStatus.PENDING, index: true })
  status: RechargeStatus;

  @Prop({ type: Types.ObjectId, ref: 'Account', default: null })
  accountId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', default: null })
  transactionId: Types.ObjectId | null;
}

export const RechargeSchema = SchemaFactory.createForClass(Recharge);
RechargeSchema.index({ employeeId: 1, createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillDocument = Bill & Document;

export enum BillType {
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  GAS = 'GAS',
  INTERNET = 'INTERNET',
  PHONE = 'PHONE',
  TV = 'TV',
  INSURANCE = 'INSURANCE',
  OTHER = 'OTHER',
  // ── Tunisian Providers ──
  STEG = 'STEG',
  SONEDE = 'SONEDE',
  TOPNET = 'TOPNET',
  TELECOM = 'TELECOM',
  TGM = 'TGM',
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'bills' })
export class Bill {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: false, trim: true, index: true })
  billerId: string;

  @Prop({ required: true, trim: true })
  billerName: string;

  @Prop({ required: true, enum: BillType, index: true })
  billType: BillType;

  @Prop({ required: true, trim: true })
  referenceNumber: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'TND', uppercase: true })
  currency: string;

  @Prop({ required: true, enum: BillStatus, default: BillStatus.PENDING, index: true })
  status: BillStatus;

  @Prop({ index: true })
  dueDate: Date;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Account', default: null })
  accountId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', default: null })
  transactionId: Types.ObjectId | null;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
BillSchema.index({ employeeId: 1, status: 1 });
BillSchema.index({ billerId: 1, referenceNumber: 1 });

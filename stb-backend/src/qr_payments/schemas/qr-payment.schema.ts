import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QrPaymentDocument = QrPayment & Document;

export enum QrPaymentType {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
}

export enum QrPaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'qr_payments' })
export class QrPayment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: QrPaymentType, index: true })
  type: QrPaymentType;

  @Prop({ min: 0 })
  amount: number;

  @Prop({ default: 'TND', uppercase: true })
  currency: string;

  @Prop({ trim: true })
  merchantName: string;

  @Prop({ trim: true })
  merchantId: string;

  @Prop({ required: true, enum: QrPaymentStatus, default: QrPaymentStatus.PENDING, index: true })
  status: QrPaymentStatus;

  @Prop({ required: true })
  qrData: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;
}

export const QrPaymentSchema = SchemaFactory.createForClass(QrPayment);
QrPaymentSchema.index({ employeeId: 1, createdAt: -1 });
QrPaymentSchema.index({ status: 1, expiresAt: 1 });

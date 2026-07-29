import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FraudDetectionDocument = FraudDetection & Document;

export enum FraudType {
  CARD_FRAUD = 'CARD_FRAUD',
  IDENTITY_THEFT = 'IDENTITY_THEFT',
  ACCOUNT_TAKEOVER = 'ACCOUNT_TAKEOVER',
  MONEY_LAUNDERING = 'MONEY_LAUNDERING',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
}

export enum FraudStatus {
  INVESTIGATING = 'INVESTIGATING',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
}

@Schema({ timestamps: true, collection: 'fraud_detections' })
export class FraudDetection {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', default: null })
  transactionId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'RiskAlert', default: null })
  alertId: Types.ObjectId | null;

  @Prop({ required: true, enum: FraudType, index: true })
  type: FraudType;

  @Prop({ required: true, min: 0, max: 100 })
  riskScore: number;

  @Prop({ type: [String], default: [] })
  factors: string[];

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;

  @Prop({ required: true, enum: FraudStatus, default: FraudStatus.INVESTIGATING, index: true })
  status: FraudStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  assignedTo: Types.ObjectId | null;

  @Prop({ trim: true })
  actionTaken: string;
}

export const FraudDetectionSchema = SchemaFactory.createForClass(FraudDetection);
FraudDetectionSchema.index({ employeeId: 1, createdAt: -1 });
FraudDetectionSchema.index({ riskScore: -1 });
FraudDetectionSchema.index({ status: 1, createdAt: -1 });

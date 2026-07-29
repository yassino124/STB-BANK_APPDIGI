import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RiskAlertDocument = RiskAlert & Document;

export enum AlertType {
  UNUSUAL_TRANSACTION = 'UNUSUAL_TRANSACTION',
  MULTIPLE_LOGINS = 'MULTIPLE_LOGINS',
  LARGE_WITHDRAWAL = 'LARGE_WITHDRAWAL',
  FOREIGN_TRANSACTION = 'FOREIGN_TRANSACTION',
  CREDIT_OVERDUE = 'CREDIT_OVERDUE',
  ACCOUNT_ANOMALY = 'ACCOUNT_ANOMALY',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
}

@Schema({ timestamps: true, collection: 'risk_alerts' })
export class RiskAlert {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: AlertType, index: true })
  type: AlertType;

  @Prop({ required: true, enum: AlertSeverity, index: true })
  severity: AlertSeverity;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ required: true, enum: AlertStatus, default: AlertStatus.OPEN, index: true })
  status: AlertStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  resolvedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  @Prop({ trim: true })
  resolution: string;
}

export const RiskAlertSchema = SchemaFactory.createForClass(RiskAlert);
RiskAlertSchema.index({ employeeId: 1, status: 1, createdAt: -1 });
RiskAlertSchema.index({ severity: 1, status: 1 });

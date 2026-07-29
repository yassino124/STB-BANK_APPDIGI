import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvestmentDocument = Investment & Document;

export enum InvestmentType {
  STOCKS = 'STOCKS',
  FUNDS = 'FUNDS',
  BONDS = 'BONDS',
  CRYPTO = 'CRYPTO',
  SAVINGS_PLAN = 'SAVINGS_PLAN',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum InvestmentStatus {
  ACTIVE = 'ACTIVE',
  MATURED = 'MATURED',
  CANCELLED = 'CANCELLED',
  LOST = 'LOST',
}

@Schema({ timestamps: true, collection: 'investments' })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: InvestmentType, index: true })
  type: InvestmentType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  initialAmount: number;

  @Prop({ default: 0 })
  currentValue: number;

  @Prop({ default: 'TND', uppercase: true })
  currency: string;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ type: Date, index: true })
  endDate: Date | null;

  @Prop({ min: 0 })
  expectedReturn: number;

  @Prop({ required: true, enum: RiskLevel, index: true })
  riskLevel: RiskLevel;

  @Prop({ required: true, enum: InvestmentStatus, default: InvestmentStatus.ACTIVE, index: true })
  status: InvestmentStatus;

  @Prop({ type: Types.ObjectId, ref: 'Account', default: null })
  accountId: Types.ObjectId | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ employeeId: 1, status: 1 });
InvestmentSchema.index({ type: 1, status: 1 });

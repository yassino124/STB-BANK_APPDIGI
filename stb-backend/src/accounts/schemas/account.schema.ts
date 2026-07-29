import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AccountType {
  COURANT = 'COURANT',
  EPARGNE = 'EPARGNE',
  DEVISE = 'DEVISE',
  JOINT = 'JOINT',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
}

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  rib: string;

  @Prop({ required: true, unique: true, index: true })
  iban: string;

  @Prop({ required: true, unique: true, index: true })
  numCompte: string;

  @Prop({ enum: AccountType, default: AccountType.COURANT, index: true })
  type: AccountType;

  @Prop({ enum: AccountStatus, default: AccountStatus.ACTIVE, index: true })
  status: AccountStatus;

  @Prop({ default: 0 })
  solde: number;

  @Prop({ default: 'TND' })
  currency: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch', default: null, index: true })
  branchId: Types.ObjectId;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: 0 })
  dailyWithdrawalLimit: number;

  @Prop({ default: 0 })
  dailyTransferLimit: number;

  @Prop({ default: 0 })
  monthlyLimit: number;

  @Prop({ default: 0 })
  dailySpent: number;

  @Prop({ default: 0 })
  monthlySpent: number;

  @Prop({ type: Date, default: null })
  lastWithdrawalReset: Date | null;

  @Prop({ type: Date, default: null })
  lastMonthlyReset: Date | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ employeeId: 1, status: 1 });
AccountSchema.index({ type: 1, status: 1 });

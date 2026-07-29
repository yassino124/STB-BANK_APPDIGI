import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  SALARY = 'SALARY',
  CREDIT_DEBIT = 'CREDIT_DEBIT',
  PRIME = 'PRIME',
  AVANCE = 'AVANCE',
  CONGE = 'CONGE',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  BONUS = 'BONUS',
  RECHARGE = 'RECHARGE',
  BILL_PAYMENT = 'BILL_PAYMENT',
  QR_PAYMENT = 'QR_PAYMENT',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  CREDIT_PAYMENT = 'CREDIT_PAYMENT',
  INVESTMENT = 'INVESTMENT',
  FEE = 'FEE',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export enum TransactionCategory {
  INCOME = 'INCOME',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  BILLS = 'BILLS',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  TRANSFER = 'TRANSFER',
  SALARY = 'SALARY',
  INVESTMENT = 'INVESTMENT',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  montant: number;

  @Prop({ required: true, enum: TransactionType, index: true })
  type: TransactionType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.COMPLETED, index: true })
  status: TransactionStatus;

  @Prop({ required: true, type: Date, default: Date.now, index: -1 })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  from: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  to: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', default: null, index: true })
  toAccountId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Card', default: null, index: true })
  cardId: Types.ObjectId | null;

  @Prop({ unique: true, trim: true, index: true })
  reference: string;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ default: 1 })
  exchangeRate: number;

  @Prop({ default: 0 })
  originalAmount: number;

  @Prop({ default: 'TND', uppercase: true })
  originalCurrency: string;

  @Prop({ enum: TransactionCategory, default: TransactionCategory.OTHER, index: true })
  category: TransactionCategory;

  @Prop({ trim: true, default: '' })
  subcategory: string;

  @Prop({ trim: true, default: '' })
  location: string;

  @Prop({ trim: true, default: '' })
  merchantName: string;

  @Prop({ trim: true, default: '' })
  merchantCategoryCode: string;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({ trim: true, default: '' })
  recurringId: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0, min: 0, max: 100 })
  fraudScore: number;

  @Prop({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW', index: true })
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ employeeId: 1, date: -1 });
TransactionSchema.index({ accountId: 1, date: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ category: 1, date: -1 });
TransactionSchema.index({ fraudScore: -1 });
TransactionSchema.index({ employeeId: 1, category: 1, date: -1 });

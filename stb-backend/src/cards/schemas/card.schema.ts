import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  PLATINUM = 'PLATINUM',
  BLACK = 'BLACK',
  VIRTUAL = 'VIRTUAL',
  CORPORATE = 'CORPORATE',
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}

export enum CardBlockReason {
  LOST = 'LOST',
  STOLEN = 'STOLEN',
  DAMAGED = 'DAMAGED',
  SUSPICIOUS = 'SUSPICIOUS',
  FRAUD = 'FRAUD',
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
}

@Schema({ timestamps: true, collection: 'cards' })
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  cardNumber: string;

  @Prop({ required: true })
  maskedNumber: string;

  @Prop({ required: true })
  expiryDate: string;

  @Prop({ required: true, select: false })
  cvvHash: string;

  @Prop({ type: String, select: false })
  pinHash: string | null;

  @Prop({ enum: CardType, default: CardType.VISA, index: true })
  type: CardType;

  @Prop({ enum: CardStatus, default: CardStatus.ACTIVE, index: true })
  status: CardStatus;

  @Prop({ default: 5000 })
  limitQuotidien: number;

  @Prop({ default: 10000 })
  limitMensuel: number;

  @Prop({ default: false })
  isVirtual: boolean;

  @Prop({ default: false })
  isFrozen: boolean;

  @Prop({ type: Date, default: null })
  frozenAt: Date | null;

  @Prop({ type: Types.ObjectId, default: null })
  frozenBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  freezeReason: string | null;

  @Prop({ type: String, enum: CardBlockReason, default: null })
  blockReason: CardBlockReason | null;

  @Prop({ type: Date, default: null })
  activatedAt: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ default: false })
  contactlessEnabled: boolean;

  @Prop({ default: false })
  onlinePaymentsEnabled: boolean;

  @Prop({ default: false })
  internationalEnabled: boolean;

  @Prop({ type: Object, default: {} })
  spendingLimits: {
    daily: number;
    weekly: number;
    monthly: number;
    atmDaily: number;
  };

  @Prop({ type: [String], default: [] })
  allowedCountries: string[];

  @Prop({ type: [String], default: [] })
  blockedCountries: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CardSchema = SchemaFactory.createForClass(Card);
CardSchema.index({ employeeId: 1, status: 1 });
CardSchema.index({ status: 1, type: 1 });
CardSchema.index({ isFrozen: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExchangeRateDocument = ExchangeRate & Document;

@Schema({ timestamps: true, collection: 'exchange_rates' })
export class ExchangeRate {
  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true, index: true })
  fromCurrency: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true, index: true })
  toCurrency: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  rate: number;

  @Prop({ default: Date.now })
  effectiveDate: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);
ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, effectiveDate: -1 }, { unique: true });

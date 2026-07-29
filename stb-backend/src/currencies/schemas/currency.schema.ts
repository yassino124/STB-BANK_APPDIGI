import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyDocument = Currency & Document;

@Schema({ timestamps: true, collection: 'currencies' })
export class Currency {
  @Prop({ required: true, unique: true, index: true, uppercase: true, length: 3 })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  symbol: string;

  @Prop({ default: 2, min: 0, max: 4 })
  decimalPlaces: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);


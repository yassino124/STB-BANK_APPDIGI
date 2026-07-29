import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AmicaleOffer extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  sub: string;

  @Prop({ required: true })
  cat: string;

  @Prop({ required: true })
  img: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AmicaleOfferSchema = SchemaFactory.createForClass(AmicaleOffer);

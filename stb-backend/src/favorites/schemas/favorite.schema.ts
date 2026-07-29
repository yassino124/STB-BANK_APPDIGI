import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

export enum FavoriteType {
  TRANSFER = 'TRANSFER',
  BILL = 'BILL',
  RECHARGE = 'RECHARGE',
  SERVICE = 'SERVICE',
}

@Schema({ timestamps: true, collection: 'favorites' })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: FavoriteType, index: true })
  type: FavoriteType;

  @Prop({ required: true, trim: true })
  referenceId: string;

  @Prop({ type: Object, default: {} })
  referenceData: Record<string, any>;

  @Prop({ trim: true })
  label: string;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
FavoriteSchema.index({ employeeId: 1, type: 1 });
FavoriteSchema.index({ employeeId: 1, referenceId: 1 }, { unique: true });

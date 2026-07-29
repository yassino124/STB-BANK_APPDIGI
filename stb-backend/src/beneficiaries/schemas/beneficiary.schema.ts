import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BeneficiaryDocument = Beneficiary & Document;

@Schema({ timestamps: true, collection: 'beneficiaries' })
export class Beneficiary {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  rib: string;

  @Prop({ trim: true })
  bankName: string;

  @Prop({ trim: true })
  accountType: string;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({ default: false })
  isInternal: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);
BeneficiarySchema.index({ employeeId: 1, rib: 1 });
BeneficiarySchema.index({ employeeId: 1, isFavorite: -1 });

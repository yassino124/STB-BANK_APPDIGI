import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true, collection: 'branches' })
export class Branch {
  @Prop({ required: true, unique: true, index: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  code: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true, index: true })
  city: string;

  @Prop({ trim: true, index: true })
  country: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true, lowercase: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  managerId: Types.ObjectId | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
BranchSchema.index({ city: 1, country: 1 });


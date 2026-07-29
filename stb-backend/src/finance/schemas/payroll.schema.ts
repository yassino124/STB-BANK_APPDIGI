import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollDocument = Payroll & Document;

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

@Schema({ timestamps: true })
export class Payroll extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  salaireBase: number;

  @Prop({ default: 0 })
  prime: number;

  @Prop({ default: 0 })
  avancesDeduites: number;

  @Prop({ default: 0 })
  creditsDeduits: number;

  @Prop({ default: 0 })
  impot: number;

  @Prop({ default: 0 })
  securiteSociale: number;

  @Prop({ required: true })
  salaireNet: number;

  @Prop({ enum: PayrollStatus, default: PayrollStatus.DRAFT })
  status: PayrollStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  validatedBy: Types.ObjectId;

  @Prop({ default: null })
  validatedAt: Date;

  @Prop({ default: '' })
  commentaire: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
PayrollSchema.index({ status: 1 });
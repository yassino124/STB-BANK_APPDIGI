import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  PAID = 'PAID',
}

@Schema({ timestamps: true })
export class Payroll extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true }) mois: number;
  @Prop({ required: true }) annee: number;

  @Prop({ default: 0 }) salaireBrut: number;
  @Prop({ default: 0 }) cnss: number;
  @Prop({ default: 0 }) impot: number;
  @Prop({ default: 0 }) prime: number;
  @Prop({ default: 0 }) heuresSup: number;
  @Prop({ default: 0 }) retenues: number;
  @Prop({ default: 0 }) salaireNet: number;

  @Prop({ enum: PayrollStatus, default: PayrollStatus.DRAFT })
  status: PayrollStatus;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
PayrollSchema.index({ employeeId: 1, mois: 1, annee: 1 }, { unique: true });

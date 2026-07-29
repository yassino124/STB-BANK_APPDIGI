import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PrimeType { PERFORMANCE = 'PERFORMANCE', AID = 'AID', RAMADAN = 'RAMADAN', VACANCES = 'VACANCES', ANCIENNETE = 'ANCIENNETE', EXCEPTIONNELLE = 'EXCEPTIONNELLE' }
export enum PrimeStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED', PAID = 'PAID' }

@Schema({ timestamps: true })
export class Prime extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' }) employeeId: Types.ObjectId;
  @Prop({ enum: PrimeType, required: true }) type: PrimeType;
  @Prop({ required: true }) montant: number;
  @Prop({ enum: PrimeStatus, default: PrimeStatus.PENDING }) status: PrimeStatus;
  @Prop({ default: '' }) description: string;
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null }) approvedBy: Types.ObjectId;
  @Prop({ default: null }) approvedAt: Date;
  @Prop({ default: null }) payrollId: Types.ObjectId;
}

export const PrimeSchema = SchemaFactory.createForClass(Prime);
PrimeSchema.index({ employeeId: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AbsenceDocument = Absence & Document;

export enum AbsenceStatus {
  PENDING_N1 = 'PENDING_N1',
  APPROVED_N1 = 'APPROVED_N1',
  PENDING_RH = 'PENDING_RH',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum AbsenceType {
  ABSENCE = 'ABSENCE',
  RETARD = 'RETARD',
  DELEGATION = 'DELEGATION',
  MISSION = 'MISSION',
}

@Schema({ timestamps: true })
export class Absence extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', index: true })
  employeeId: Types.ObjectId;

  @Prop({ enum: AbsenceType, required: true, index: true })
  type: AbsenceType;

  @Prop({ required: true, type: Date })
  dateDebut: Date;

  @Prop({ required: true, type: Date })
  dateFin: Date;

  @Prop({ required: true })
  nombreHeures: number;

  @Prop({ default: '' })
  motif: string;

  @Prop({ default: null })
  pieceJointe: string;

  @Prop({ enum: AbsenceStatus, default: AbsenceStatus.PENDING_N1, index: true })
  status: AbsenceStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  managerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  n1ApprovedBy: Types.ObjectId;

  @Prop({ default: null })
  n1ApprovedAt: Date;

  @Prop({ default: '' })
  n1Commentaire: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  rhApprovedBy: Types.ObjectId;

  @Prop({ default: null })
  rhApprovedAt: Date;

  @Prop({ default: '' })
  rhCommentaire: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  validatedBy: Types.ObjectId;

  @Prop({ default: null })
  validatedAt: Date;

  @Prop({ default: '' })
  commentaire: string;
}

export const AbsenceSchema = SchemaFactory.createForClass(Absence);
AbsenceSchema.index({ employeeId: 1, status: 1 });
AbsenceSchema.index({ managerId: 1, status: 1 });
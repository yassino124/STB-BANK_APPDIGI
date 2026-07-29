import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

export enum LeaveStatus { PENDING_N1 = 'PENDING_N1', APPROVED_N1 = 'APPROVED_N1', PENDING_RH = 'PENDING_RH', APPROVED = 'APPROVED', REJECTED = 'REJECTED', CANCELLED = 'CANCELLED' }
export enum LeaveType { REPOS = 'REPOS', MALADIE = 'MALADIE', EXCEPTIONNEL = 'EXCEPTIONNEL', SANS_SOLDE = 'SANS_SOLDE', MATERNITE = 'MATERNITE' }

@Schema({ timestamps: true })
export class LeaveRequest extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' }) employeeId: Types.ObjectId;
  @Prop({ enum: LeaveType, default: LeaveType.REPOS }) type: LeaveType;
  @Prop({ required: true }) dateDebut: Date;
  @Prop({ required: true }) dateFin: Date;
  @Prop({ required: true }) nombreJours: number;
  @Prop({ default: '' }) motif: string;
  @Prop({ default: null }) pieceJointe: string;
  @Prop({ enum: LeaveStatus, default: LeaveStatus.PENDING_N1 }) status: LeaveStatus;
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null }) managerId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null }) n1ApprovedBy: Types.ObjectId;
  @Prop({ default: null }) n1ApprovedAt: Date;
  @Prop({ default: '' }) n1Commentaire: string;
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null }) rhApprovedBy: Types.ObjectId;
  @Prop({ default: null }) rhApprovedAt: Date;
  @Prop({ default: '' }) rhCommentaire: string;
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null }) validatedBy: Types.ObjectId;
  @Prop({ default: null }) validatedAt: Date;
  @Prop({ default: '' }) commentaire: string;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ managerId: 1, status: 1 });

@Schema({ timestamps: true })
export class LeaveBalance extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', unique: true }) employeeId: Types.ObjectId;
  @Prop({ default: 90 }) soldeAnnuel: number;
  @Prop({ default: 0 }) soldeUtilise: number;
  @Prop({ default: 0 }) soldeReporte: number;
  get soldeDisponible(): number { return this.soldeAnnuel - this.soldeUtilise + this.soldeReporte; }
  @Prop({ default: new Date().getFullYear() }) annee: number;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);

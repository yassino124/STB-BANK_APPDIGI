import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AuthorizationType {
  SORTIE = 'SORTIE',
  MISSION = 'MISSION',
  TELETRAVAIL = 'TELETRAVAIL',
  RETARD = 'RETARD',
  HEURES_SUP = 'HEURES_SUP',
  CONGE = 'CONGE',
  FORMATION = 'FORMATION',
  DELEGATION = 'DELEGATION',
}

export enum AuthorizationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum AuthorizationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Schema({ timestamps: true })
export class Authorization extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', index: true }) employeeId: Types.ObjectId;
  @Prop({ enum: AuthorizationType, required: true, index: true }) type: AuthorizationType;
  @Prop({ required: true, type: Date }) date: Date;
  @Prop({ default: '' }) heureDebut: string;
  @Prop({ default: '' }) heureFin: string;
  @Prop({ default: '' }) motif: string;
  @Prop({ enum: AuthorizationStatus, default: AuthorizationStatus.PENDING, index: true }) status: AuthorizationStatus;
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null }) approvedBy: Types.ObjectId;
  @Prop({ default: '' }) commentaire: string;

  // ─── Enhanced Fields ───────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null, index: true }) approverId: Types.ObjectId | null;
  @Prop({ type: Date, default: null }) approvedAt: Date | null;
  @Prop({ type: String, default: null }) rejectionReason: string | null;
  @Prop({ enum: AuthorizationPriority, default: AuthorizationPriority.NORMAL, index: true }) priority: AuthorizationPriority;
  @Prop({ type: Object, default: {} }) metadata: Record<string, any>;
}

export const AuthorizationSchema = SchemaFactory.createForClass(Authorization);
AuthorizationSchema.index({ employeeId: 1, status: 1 });
AuthorizationSchema.index({ approverId: 1, status: 1 });
AuthorizationSchema.index({ type: 1, status: 1 });

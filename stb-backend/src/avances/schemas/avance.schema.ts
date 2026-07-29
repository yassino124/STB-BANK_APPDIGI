import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AvanceType {
  SALAIRE = 'SALAIRE',
  PRIME = 'PRIME',
  PRIME_AID = 'PRIME_AID',
}

export enum AvanceStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REFUSE = 'REFUSE',
  DEBITEE = 'DEBITEE',
}

@Schema({ timestamps: true })
export class Avance extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', index: true })
  employee: Types.ObjectId;

  @Prop({ required: true, enum: AvanceType })
  type: AvanceType;

  @Prop({ required: true })
  montant: number;

  @Prop({ type: String, default: null })
  motif: string | null;

  @Prop({ required: true, enum: AvanceStatut, default: AvanceStatut.EN_ATTENTE, index: true })
  statut: AvanceStatut;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  approvedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', default: null })
  transactionId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  debitedAt: Date | null;
}

export const AvanceSchema = SchemaFactory.createForClass(Avance);
AvanceSchema.index({ employee: 1, statut: 1 });
AvanceSchema.index({ createdAt: -1 });

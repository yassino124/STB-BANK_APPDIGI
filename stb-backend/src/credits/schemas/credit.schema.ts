import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CreditStatus { ACTIVE = 'ACTIVE', CLOSED = 'CLOSED', LATE = 'LATE', PENDING = 'PENDING' }
export enum CreditType { PERSONNEL = 'PERSONNEL', IMMOBILIER = 'IMMOBILIER', AUTO = 'AUTO', MOYEN_TERME = 'MOYEN_TERME' }

@Schema({ timestamps: true })
export class Credit extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' }) employeeId: Types.ObjectId;
  @Prop({ required: true }) title: string;
  @Prop({ enum: CreditType, default: CreditType.PERSONNEL }) type: CreditType;
  @Prop({ required: true }) montantInitial: number;
  @Prop({ required: true }) montantRestant: number;
  @Prop({ required: true }) tauxInteret: number; // in %
  @Prop({ required: true }) mensualite: number;
  @Prop({ required: true }) nombreMois: number;
  @Prop({ required: true }) dateDebut: Date;
  @Prop({ required: true }) dateFin: Date;
  @Prop({ enum: CreditStatus, default: CreditStatus.PENDING }) status: CreditStatus;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);
CreditSchema.index({ employeeId: 1, status: 1 });

@Schema({ timestamps: true })
export class CreditPayment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Credit' }) creditId: Types.ObjectId;
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' }) employeeId: Types.ObjectId;
  @Prop({ required: true }) montant: number;
  @Prop({ required: true }) capital: number; // Part remboursant le capital
  @Prop({ required: true }) interets: number; // Part des intérêts
  @Prop({ required: true }) montantRestantApres: number; // Solde après paiement
  @Prop({ required: true }) datePaiement: Date;
  @Prop({ default: 'AUTO' }) mode: string; // AUTO, MANUAL, ANTICIPE
  @Prop({ type: Types.ObjectId, ref: 'Transaction' }) transactionId?: Types.ObjectId; // Lien vers transaction bancaire
  @Prop({ default: false }) isLate: boolean; // Paiement en retard
  @Prop({ default: 0 }) penalite: number; // Montant pénalité si retard
}

export const CreditPaymentSchema = SchemaFactory.createForClass(CreditPayment);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CongeType {
  REPOS = 'REPOS',
  MALADIE = 'MALADIE',
  MARIAGE = 'MARIAGE',
  NAISSANCE = 'NAISSANCE',
  DECES = 'DECES',
  PELERINAGE = 'PELERINAGE',
  SANS_SOLDE = 'SANS_SOLDE',
}

export enum CongeStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_ATTENTE_RH = 'EN_ATTENTE_RH',
  EN_ATTENTE_DG = 'EN_ATTENTE_DG',
  APPROUVE = 'APPROUVE',
  REFUSE = 'REFUSE',
}

export const CONGE_RULES = {
  REPOS: { dureeMax: null, deductFromSolde: true, justificatifRequis: false, limiteCarriere: null },
  MALADIE: { dureeMax: null, deductFromSolde: true, justificatifRequis: true, limiteCarriere: null },
  MARIAGE: { dureeMax: 3, deductFromSolde: false, justificatifRequis: true, limiteCarriere: 1 },
  NAISSANCE: { dureeMax: 3, deductFromSolde: false, justificatifRequis: true, limiteCarriere: null },
  DECES: { dureeMax: 3, deductFromSolde: false, justificatifRequis: true, limiteCarriere: null },
  PELERINAGE: { dureeMax: 30, deductFromSolde: false, justificatifRequis: true, limiteCarriere: 1 },
  SANS_SOLDE: { dureeMax: null, deductFromSolde: false, justificatifRequis: false, limiteCarriere: null },
};

@Schema({ timestamps: true })
export class Conge extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  @Prop({ required: true, enum: CongeType })
  type: CongeType;

  @Prop({ required: true, enum: CongeStatus, default: CongeStatus.EN_ATTENTE })
  status: CongeStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  dureeDays: number;

  @Prop()
  motif: string;

  @Prop({ type: Object })
  justificatif?: {
    filename: string;
    url: string;
    mimetype: string;
    uploadedAt: Date;
  };

  @Prop({ type: Object, default: {} })
  approvals: {
    manager?: { approved: boolean; date: Date; managerId: Types.ObjectId };
    rh?: { approved: boolean; date: Date; rhId: Types.ObjectId };
    dg?: { approved: boolean; date: Date; dgId: Types.ObjectId };
  };

  @Prop()
  refusalReason?: string;

  @Prop({ default: false })
  countedInCarrierLimit: boolean;
}

export const CongeSchema = SchemaFactory.createForClass(Conge);

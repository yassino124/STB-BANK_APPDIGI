import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RequestType {
  CONGE = 'CONGE',
  AVANCE = 'AVANCE',
  CREDIT = 'CREDIT',
  PRIME = 'PRIME',
  DOCUMENT = 'DOCUMENT',
  CARTE = 'CARTE',
}

export enum RequestStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REFUSE = 'REFUSE',
  ANNULE = 'ANNULE',
}

@Schema({ timestamps: true })
export class Request extends Document {
  @Prop({ required: true, enum: RequestType })
  type: RequestType;

  @Prop({ required: true, enum: RequestStatus, default: RequestStatus.EN_ATTENTE })
  status: RequestStatus;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee' })
  employeeId: Types.ObjectId;

  // Polymorphic payload based on type
  // Example for CONGE: { type: 'Repos', debut: '2026-06-23', fin: '2026-06-25', days: 3 }
  // Example for AVANCE: { type: 'Avance sur Salaire', amount: 500, details: '...' }
  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ default: null })
  responseMessage: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

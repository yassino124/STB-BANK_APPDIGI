import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';

export type DocumentDocument = EmployeeDocument & MongooseDocument;

export enum DocumentType {
  PAYSLIP = 'PAYSLIP', // Fiche de paie
  WORK_CERTIFICATE = 'WORK_CERTIFICATE', // Attestation de travail
  SALARY_CERTIFICATE = 'SALARY_CERTIFICATE', // Attestation de salaire
  TAX_DECLARATION = 'TAX_DECLARATION', // Déclaration fiscale
  CNSS_DECLARATION = 'CNSS_DECLARATION', // Déclaration CNSS
  CONTRACT = 'CONTRACT', // Contrat
  ID_DOCUMENT = 'ID_DOCUMENT', // Pièce d'identité
  OTHER = 'OTHER',
}

@Schema({ timestamps: true, collection: 'documents' })
export class EmployeeDocument {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, enum: DocumentType, index: true })
  type: DocumentType;

  @Prop({ required: true })
  fileUrl: string; // URL or base64 of the document

  @Prop({ required: true })
  fileName: string;

  @Prop()
  fileSize: number; // in bytes

  @Prop({ default: 'application/pdf' })
  mimeType: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  uploadedBy: Types.ObjectId; // RH who uploaded

  @Prop({ default: false })
  isRead: boolean; // Has employee viewed it

  @Prop({ index: true })
  year: number; // For filtering by year

  @Prop({ index: true })
  month: number; // For filtering by month (payslips)

  @Prop({ default: true })
  isActive: boolean;
}

export const EmployeeDocumentSchema = SchemaFactory.createForClass(EmployeeDocument);
EmployeeDocumentSchema.index({ employeeId: 1, type: 1 });
EmployeeDocumentSchema.index({ employeeId: 1, year: 1, month: 1 });

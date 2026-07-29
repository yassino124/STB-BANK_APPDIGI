import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

export enum ReportType {
  EMPLOYEE = 'EMPLOYEE',
  FINANCIAL = 'FINANCIAL',
  PAYROLL = 'PAYROLL',
  LEAVE = 'LEAVE',
  CREDIT = 'CREDIT',
  AUDIT = 'AUDIT',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'reports' })
export class Report {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ReportType, index: true })
  type: ReportType;

  @Prop({ required: true, enum: ReportFormat, index: true })
  format: ReportFormat;

  @Prop({ type: Object, default: {} })
  parameters: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  generatedBy: Types.ObjectId;

  @Prop({ trim: true })
  fileUrl: string;

  @Prop({ default: 0 })
  fileSize: number;

  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.PENDING, index: true })
  status: ReportStatus;

  @Prop({ type: Date, default: null, index: true })
  expiresAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ type: 1, status: 1 });
ReportSchema.index({ generatedBy: 1, createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

export enum AnalyticsPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Schema({ timestamps: true, collection: 'analytics' })
export class Analytics {
  @Prop({ type: Types.ObjectId, ref: 'Employee', index: true, default: null })
  employeeId: Types.ObjectId | null;

  @Prop({ required: true, trim: true, index: true })
  metric: string;

  @Prop({ required: true })
  value: number;

  @Prop({ type: Object, default: {} })
  dimensions: Record<string, any>;

  @Prop({ required: true, enum: AnalyticsPeriod, index: true })
  period: AnalyticsPeriod;

  @Prop({ required: true, index: -1 })
  startDate: Date;

  @Prop({ required: true, index: -1 })
  endDate: Date;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
AnalyticsSchema.index({ employeeId: 1, metric: 1, period: 1, startDate: -1 });

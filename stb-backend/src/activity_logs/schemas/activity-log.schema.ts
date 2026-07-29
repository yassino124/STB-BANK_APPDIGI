import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true, collection: 'activity_logs' })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  action: string;

  @Prop({ required: true, trim: true, index: true })
  module: string;

  @Prop({ trim: true, index: true })
  resource: string;

  @Prop({ trim: true })
  resourceId: string;

  @Prop({ type: Object, default: {} })
  changes: Record<string, any>;

  @Prop({ trim: true })
  ip: string;

  @Prop({ trim: true })
  userAgent: string;

  @Prop({ type: Object, default: {} })
  deviceInfo: Record<string, any>;

  @Prop({ default: true })
  success: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ employeeId: 1, createdAt: -1 });
ActivityLogSchema.index({ module: 1, action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

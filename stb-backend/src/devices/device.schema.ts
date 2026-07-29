import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

export enum Platform {
  IOS = 'iOS',
  ANDROID = 'Android',
  WEB = 'Web',
}

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true, type: String })
  deviceUUID: string;

  @Prop({ required: true, type: String })
  deviceName: string;

  @Prop({ type: String, enum: Platform, default: Platform.IOS })
  platform: Platform;

  @Prop({ type: String, default: null })
  model: string | null;

  @Prop({ type: String, default: null })
  osVersion: string | null;

  @Prop({ type: Boolean, default: false })
  trusted: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: String, default: null })
  lastLoginIp: string | null;

  @Prop({ type: String, default: null })
  lastLoginLocation: string | null;

  @Prop({ type: Boolean, default: false })
  biometricsEnabled: boolean;

  @Prop({ type: Number, default: 0 })
  loginCount: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.index({ employeeId: 1, trusted: 1 });

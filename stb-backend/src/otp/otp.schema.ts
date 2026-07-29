import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OtpDocument = Otp & Document;

export enum OtpPurpose {
  ACTIVATION = 'ACTIVATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  DEVICE_CHANGE = 'DEVICE_CHANGE',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

@Schema({ timestamps: true, collection: 'otps' })
export class Otp {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, type: String })
  codeHash: string;

  @Prop({ type: String, enum: OtpPurpose, required: true })
  purpose: OtpPurpose;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  used: boolean;

  @Prop({ type: Number, default: 0 })
  attempts: number;

  @Prop({ type: String, default: null })
  sentToEmail: string | null;

  @Prop({ type: String, default: null })
  sentToPhone: string | null;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ employeeId: 1, purpose: 1, used: 1 });

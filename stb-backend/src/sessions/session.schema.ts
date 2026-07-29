import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true, collection: 'sessions' })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Device', default: null })
  deviceId: Types.ObjectId | null;

  @Prop({ required: true, unique: true, index: true, type: String })
  accessToken: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  refreshToken: string;

  @Prop({ required: true, type: Date })
  accessTokenExpiresAt: Date;

  @Prop({ required: true, type: Date })
  refreshTokenExpiresAt: Date;

  @Prop({ type: Boolean, default: false })
  isRevoked: boolean;

  @Prop({ type: Date, default: null })
  revokedAt: Date | null;

  @Prop({ type: String, default: null })
  ip: string | null;

  @Prop({ type: String, default: null })
  userAgent: string | null;

  @Prop({ type: String, default: null })
  location: string | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ employeeId: 1, isRevoked: 1 });
SessionSchema.index({ refreshTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });

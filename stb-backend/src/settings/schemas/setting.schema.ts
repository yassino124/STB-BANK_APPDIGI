import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SettingDocument = Setting & Document;

export enum SettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  ARRAY = 'ARRAY',
}

@Schema({ timestamps: true, collection: 'settings' })
export class Setting {
  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  key: string;

  @Prop({ type: Object, required: true })
  value: any;

  @Prop({ required: true, enum: SettingType, default: SettingType.STRING })
  type: SettingType;

  @Prop({ default: 'GENERAL', index: true })
  category: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  updatedBy: Types.ObjectId | null;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
SettingSchema.index({ category: 1, key: 1 });


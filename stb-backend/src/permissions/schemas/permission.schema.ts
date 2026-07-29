import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true, collection: 'permissions' })
export class Permission {
  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  resource: string;

  @Prop({ required: true, trim: true, index: true })
  action: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });


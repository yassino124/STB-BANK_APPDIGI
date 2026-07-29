import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

export enum ServiceCategory {
  BANKING = 'BANKING',
  HR = 'HR',
  FINANCE = 'FINANCE',
  IT = 'IT',
  SUPPORT = 'SUPPORT',
}

@Schema({ timestamps: true, collection: 'services' })
export class Service {
  @Prop({ required: true, unique: true, index: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ enum: ServiceCategory, required: true, index: true })
  category: ServiceCategory;

  @Prop({ default: true })
  isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
ServiceSchema.index({ category: 1, isActive: 1 });


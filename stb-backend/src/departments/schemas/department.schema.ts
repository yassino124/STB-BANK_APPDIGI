import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true, collection: 'departments' })
export class Department {
  @Prop({ required: true, unique: true, index: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  code: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  managerId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  parentDepartmentId: Types.ObjectId | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  employeeCount: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.index({ parentDepartmentId: 1 });


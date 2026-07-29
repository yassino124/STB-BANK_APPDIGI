import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HierarchyDocument = Hierarchy & Document;

@Schema({ timestamps: true, collection: 'hierarchies' })
export class Hierarchy {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Employee', unique: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  managerId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  managerName: string | null;

  @Prop({ type: Number, default: 1 })
  level: number;

  @Prop({ type: Boolean, default: false })
  isManager: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Employee', default: [] })
  directReports: Types.ObjectId[];
}

export const HierarchySchema = SchemaFactory.createForClass(Hierarchy);
HierarchySchema.index({ employeeId: 1, managerId: 1 });
HierarchySchema.index({ directReports: 1 });
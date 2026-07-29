import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChequeRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // '20', '50', 'CERTIFIE'

  @Prop({ required: true, default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED
}

export const ChequeRequestSchema = SchemaFactory.createForClass(ChequeRequest);

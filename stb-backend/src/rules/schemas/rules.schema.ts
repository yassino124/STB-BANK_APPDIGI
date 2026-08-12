import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class BusinessRule extends Document {
  @Prop({ required: true, unique: true, default: 'GLOBAL' })
  scope: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  config: Record<string, any>;
}

export const BusinessRuleSchema = SchemaFactory.createForClass(BusinessRule);

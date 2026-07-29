import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BudgetDocument = Budget & Document;

export enum BudgetCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  BILLS = 'BILLS',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  SAVINGS = 'SAVINGS',
  TRAVEL = 'TRAVEL',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER',
}

export enum BudgetPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum BudgetType {
  SPENDING = 'SPENDING', // Traditional budget - track spending
  SAVINGS_GOAL = 'SAVINGS_GOAL', // Savings goal - track progress towards a target
}

@Schema({ timestamps: true, collection: 'budgets' })
export class Budget {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: BudgetCategory, index: true })
  category: BudgetCategory;

  @Prop({ required: true, enum: BudgetType, default: BudgetType.SPENDING, index: true })
  type: BudgetType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: BudgetPeriod, index: true })
  period: BudgetPeriod;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ default: 0 })
  spent: number;

  @Prop({ default: 0 })
  saved: number; // For savings goals

  @Prop({ default: 'TND', uppercase: true })
  currency: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 80, min: 0, max: 100 })
  alertThreshold: number;

  @Prop({ default: false })
  notificationSent: boolean; // Track if notification was sent

  @Prop()
  targetDate: Date; // Optional target date for savings goals

  @Prop()
  description: string; // Optional description for the goal
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
BudgetSchema.index({ employeeId: 1, isActive: 1 });
BudgetSchema.index({ employeeId: 1, category: 1, period: 1 });
BudgetSchema.index({ employeeId: 1, type: 1 });

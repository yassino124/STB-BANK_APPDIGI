import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../common/enums/role.enum';
import { EmployeeStatus } from '../common/enums/employee-status.enum';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true, collection: 'employees' })
export class Employee {
  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  matricule: string;

  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  cin: string;

  @Prop({ required: true, type: Date, index: true })
  dateNaissance: Date;

  @Prop({ required: true, type: String, index: true })
  nom: string;

  @Prop({ required: true, type: String, index: true })
  prenom: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  phone: string;

  @Prop({ type: String, default: null, select: false })
  passwordHash: string | null;

  @Prop({ type: String, default: null, select: false })
  pinHash: string | null;

  @Prop({ type: [String], enum: Role, default: [Role.EMPLOYEE], index: true })
  roles: Role[];

  @Prop({ type: String, enum: EmployeeStatus, default: EmployeeStatus.PENDING_ACTIVATION, index: true })
  status: EmployeeStatus;

  @Prop({ type: Boolean, default: false })
  faceEnabled: boolean;

  @Prop({ type: Boolean, default: false })
  fingerEnabled: boolean;

  @Prop({ type: Boolean, default: false })
  isActivated: boolean;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: Date, default: null })
  passwordChangedAt: Date | null;

  @Prop({ type: String, default: null, trim: true })
  avatar: string | null;

  @Prop({ type: String, default: null, trim: true })
  address: string | null;

  @Prop({ type: String, default: null, trim: true, index: true })
  city: string | null;

  @Prop({ type: String, default: null, trim: true, index: true })
  country: string | null;

  @Prop({ type: String, default: null, trim: true })
  poste: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null, index: true })
  departmentId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Branch', default: null, index: true })
  branchId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  managerId: Types.ObjectId | null;

  @Prop({ type: String, default: null, trim: true })
  contractType: string | null;

  @Prop({ type: Date, default: null })
  contractStart: Date | null;

  @Prop({ type: Date, default: null })
  contractEnd: Date | null;

  @Prop({ type: String, default: null, trim: true })
  workSchedule: string | null;

  @Prop({ type: String, default: null, trim: true })
  shiftPattern: string | null;

  @Prop({ type: String, default: null, trim: true })
  emergencyContactName: string | null;

  @Prop({ type: String, default: null, trim: true })
  emergencyContactPhone: string | null;

  @Prop({ type: String, default: null, trim: true })
  emergencyContactRelationship: string | null;

  @Prop({ type: String, default: null, trim: true })
  bankRib: string | null;

  @Prop({ type: String, default: null, trim: true })
  bankName: string | null;

  @Prop({ type: Number, default: 90, max: 90, min: 0 })
  soldeConges: number;

  @Prop({ default: 0 })
  creditsEnCours: number;

  @Prop({ default: 0 })
  avancesEnCours: number;

  @Prop({ default: 0 })
  prime: number;

  @Prop({ type: Number, default: 1200 })
  salaireBase: number;

  @Prop({ type: Date, default: Date.now, index: true })
  dateEmbauche: Date;

  @Prop({ type: Number, default: 0 })
  compteSolde: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ matricule: 1, cin: 1 });
EmployeeSchema.index({ status: 1, roles: 1 });
EmployeeSchema.index({ departmentId: 1, status: 1 });
EmployeeSchema.index({ branchId: 1, status: 1 });
EmployeeSchema.index({ managerId: 1 });
EmployeeSchema.index({ createdAt: -1 });

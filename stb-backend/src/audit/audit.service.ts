import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';
import { AuditAction } from '../common/enums/audit-action.enum';

export interface AuditContext {
  ip?: string;
  userAgent?: string;
  location?: string;
  deviceUUID?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(
    employeeId: string,
    action: AuditAction,
    success: boolean,
    context: AuditContext = {},
  ): Promise<void> {
    try {
      await this.auditModel.create({
        employeeId: new Types.ObjectId(employeeId),
        action,
        success,
        ip: context.ip || null,
        userAgent: context.userAgent || null,
        location: context.location || null,
        deviceUUID: context.deviceUUID || null,
        metadata: context.metadata || null,
      });
    } catch (err) {
      this.logger.error(`Audit log failed for ${action}: ${err.message}`);
    }
  }

  async getEmployeeLogs(
    employeeId: string,
    limit = 50,
    skip = 0,
  ): Promise<AuditLog[]> {
    return this.auditModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getRecentLogins(employeeId: string, limit = 10): Promise<AuditLog[]> {
    return this.auditModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        action: { $in: [AuditAction.LOGIN, AuditAction.LOGIN_FAILED] },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

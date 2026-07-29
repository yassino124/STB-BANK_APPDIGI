import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';
import { AuditAction } from '../common/enums/audit-action.enum';
export interface AuditContext {
    ip?: string;
    userAgent?: string;
    location?: string;
    deviceUUID?: string;
    metadata?: Record<string, any>;
}
export declare class AuditService {
    private auditModel;
    private readonly logger;
    constructor(auditModel: Model<AuditLogDocument>);
    log(employeeId: string, action: AuditAction, success: boolean, context?: AuditContext): Promise<void>;
    getEmployeeLogs(employeeId: string, limit?: number, skip?: number): Promise<AuditLog[]>;
    getRecentLogins(employeeId: string, limit?: number): Promise<AuditLog[]>;
}

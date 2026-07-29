import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getMyLogs(employeeId: string, limit?: number, skip?: number): Promise<import("./audit-log.schema").AuditLog[]>;
    getMyLogins(employeeId: string): Promise<import("./audit-log.schema").AuditLog[]>;
    getEmployeeLogs(employeeId: string, limit?: number, skip?: number): Promise<import("./audit-log.schema").AuditLog[]>;
}

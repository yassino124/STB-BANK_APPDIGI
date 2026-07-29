"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("./audit-log.schema");
const audit_action_enum_1 = require("../common/enums/audit-action.enum");
let AuditService = AuditService_1 = class AuditService {
    auditModel;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(auditModel) {
        this.auditModel = auditModel;
    }
    async log(employeeId, action, success, context = {}) {
        try {
            await this.auditModel.create({
                employeeId: new mongoose_2.Types.ObjectId(employeeId),
                action,
                success,
                ip: context.ip || null,
                userAgent: context.userAgent || null,
                location: context.location || null,
                deviceUUID: context.deviceUUID || null,
                metadata: context.metadata || null,
            });
        }
        catch (err) {
            this.logger.error(`Audit log failed for ${action}: ${err.message}`);
        }
    }
    async getEmployeeLogs(employeeId, limit = 50, skip = 0) {
        return this.auditModel
            .find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
    async getRecentLogins(employeeId, limit = 10) {
        return this.auditModel
            .find({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            action: { $in: [audit_action_enum_1.AuditAction.LOGIN, audit_action_enum_1.AuditAction.LOGIN_FAILED] },
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditService);
//# sourceMappingURL=audit.service.js.map
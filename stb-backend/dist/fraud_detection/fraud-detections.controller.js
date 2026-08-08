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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fraud_detections_service_1 = require("./fraud-detections.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const SECURITY_ROLES = [role_enum_1.Role.IT, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.RH, role_enum_1.Role.FINANCE, role_enum_1.Role.MANAGER];
let FraudDetectionsController = class FraudDetectionsController {
    fraudDetectionsService;
    constructor(fraudDetectionsService) {
        this.fraudDetectionsService = fraudDetectionsService;
    }
    create(data) {
        return this.fraudDetectionsService.create(data);
    }
    findAll(limit = 50) {
        return this.fraudDetectionsService.findAll(+limit);
    }
    getSummary() {
        return this.fraudDetectionsService.getSummary();
    }
    getMonthlyStats(months = 6) {
        return this.fraudDetectionsService.getMonthlyStats(+months);
    }
    getByType() {
        return this.fraudDetectionsService.getByType();
    }
    findHighRisk(threshold = 70) {
        return this.fraudDetectionsService.findHighRisk(+threshold);
    }
    findByEmployee(employeeId) {
        return this.fraudDetectionsService.findByEmployee(employeeId);
    }
    findOne(id) {
        return this.fraudDetectionsService.findOne(id);
    }
    updateStatus(id, status, assignedTo) {
        return this.fraudDetectionsService.updateStatus(id, status, assignedTo);
    }
};
exports.FraudDetectionsController = FraudDetectionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.IT, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Create fraud detection record' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: '📋 List all fraud detections (populated with employee info)' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: '📊 Get fraud detection summary stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('monthly'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: '📈 Monthly fraud stats for Direction dashboard' }),
    __param(0, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "getMonthlyStats", null);
__decorate([
    (0, common_1.Get)('by-type'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: '📊 Fraud count by type' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "getByType", null);
__decorate([
    (0, common_1.Get)('high-risk'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: '🔴 List high risk detections' }),
    __param(0, (0, common_1.Query)('threshold')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "findHighRisk", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Get fraud detections for specific employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Get fraud detection by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(...SECURITY_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Update fraud detection status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('assignedTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FraudDetectionsController.prototype, "updateStatus", null);
exports.FraudDetectionsController = FraudDetectionsController = __decorate([
    (0, swagger_1.ApiTags)('🛡️ Fraud Detection'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('fraud-detections'),
    __metadata("design:paramtypes", [fraud_detections_service_1.FraudDetectionsService])
], FraudDetectionsController);
//# sourceMappingURL=fraud-detections.controller.js.map
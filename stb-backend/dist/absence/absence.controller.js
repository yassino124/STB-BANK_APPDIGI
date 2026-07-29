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
exports.AbsenceController = void 0;
const common_1 = require("@nestjs/common");
const absence_service_1 = require("./absence.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const swagger_1 = require("@nestjs/swagger");
let AbsenceController = class AbsenceController {
    absenceService;
    constructor(absenceService) {
        this.absenceService = absenceService;
    }
    create(req, dto) {
        return this.absenceService.create(req.user.sub, dto);
    }
    getMine(req) {
        return this.absenceService.getMyAbsences(req.user.sub);
    }
    getPendingForManager(req) {
        return this.absenceService.getPendingForManager(req.user.sub);
    }
    getPendingRh() {
        return this.absenceService.getPendingForRh();
    }
    getAll(status) {
        return this.absenceService.getAll(status);
    }
    handleManagerApproval(id, req, body) {
        return this.absenceService.handleManagerApproval(id, req.user.sub, body.decision, body.commentaire);
    }
    handleRhApproval(id, req, body) {
        return this.absenceService.handleRhApproval(id, req.user.sub, body.decision, body.commentaire);
    }
    cancel(id, req) {
        return this.absenceService.cancel(id, req.user.sub);
    }
};
exports.AbsenceController = AbsenceController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit absence request (Employee)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'My absence requests' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('pending-manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Absence requests pending my N+1 approval' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "getPendingForManager", null);
__decorate([
    (0, common_1.Get)('pending-rh'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Pending RH validation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "getPendingRh", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'All requests (RH)' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "getAll", null);
__decorate([
    (0, common_1.Patch)(':id/handle-manager'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager approves or rejects absence (N+1)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "handleManagerApproval", null);
__decorate([
    (0, common_1.Patch)(':id/handle-rh'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'RH validates or rejects approved absence request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "handleRhApproval", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel pending absence request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AbsenceController.prototype, "cancel", null);
exports.AbsenceController = AbsenceController = __decorate([
    (0, swagger_1.ApiTags)('Absence Requests'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('absences'),
    __metadata("design:paramtypes", [absence_service_1.AbsenceService])
], AbsenceController);
//# sourceMappingURL=absence.controller.js.map
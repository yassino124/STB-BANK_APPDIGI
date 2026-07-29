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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const swagger_1 = require("@nestjs/swagger");
let LeaveController = class LeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    create(req, dto) {
        return this.leaveService.createRequest(req.user.sub, dto);
    }
    getMine(req) {
        return this.leaveService.getMyRequests(req.user.sub);
    }
    getBalance(req) {
        return this.leaveService.getMyBalance(req.user.sub);
    }
    getPendingForManager(req) {
        return this.leaveService.getPendingForManager(req.user.sub);
    }
    getMyTeamRequests(req) {
        return this.leaveService.getMyTeamRequests(req.user.sub);
    }
    getAll(status) {
        return this.leaveService.getAllRequests(status);
    }
    getPendingRh() {
        return this.leaveService.getAllRequests('APPROVED_N1');
    }
    handleManagerApproval(id, req, body) {
        return this.leaveService.handleManagerApproval(id, req.user.sub, body.decision, body.commentaire);
    }
    handleRhApproval(id, req, body) {
        return this.leaveService.handleRhApproval(id, req.user.sub, body.decision, body.commentaire);
    }
    managerApprove(id, req, body) {
        return this.leaveService.handleManagerApproval(id, req.user.sub, 'APPROVED', body.commentaire || '');
    }
    managerReject(id, req, body) {
        return this.leaveService.handleManagerApproval(id, req.user.sub, 'REJECTED', body.commentaire || 'Refusé par le manager');
    }
    getPendingTeam(req) {
        return this.leaveService.getPendingForManager(req.user.sub);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit leave request (Employee)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'My leave requests' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('my-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'My leave balance' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('pending-manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave requests pending my N+1 approval' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getPendingForManager", null);
__decorate([
    (0, common_1.Get)('my-team'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'All leave requests from my direct reports' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getMyTeamRequests", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'All requests (RH)' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('pending-rh'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Pending RH validation' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getPendingRh", null);
__decorate([
    (0, common_1.Patch)(':id/handle-manager'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager approves or rejects leave (N+1)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "handleManagerApproval", null);
__decorate([
    (0, common_1.Patch)(':id/handle-rh'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'RH validates or rejects approved leave request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "handleRhApproval", null);
__decorate([
    (0, common_1.Post)(':id/manager-approve'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: '✅ Manager approves leave (simplified endpoint for mobile)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "managerApprove", null);
__decorate([
    (0, common_1.Post)(':id/manager-reject'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: '❌ Manager rejects leave (simplified endpoint for mobile)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "managerReject", null);
__decorate([
    (0, common_1.Get)('pending-team'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: '📋 Get all pending leave requests from my team (for swipe UI)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getPendingTeam", null);
exports.LeaveController = LeaveController = __decorate([
    (0, swagger_1.ApiTags)('� Leave Requests'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('leave'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map
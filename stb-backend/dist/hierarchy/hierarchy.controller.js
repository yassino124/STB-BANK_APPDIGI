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
exports.HierarchyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hierarchy_service_1 = require("./hierarchy.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
let HierarchyController = class HierarchyController {
    hierarchyService;
    constructor(hierarchyService) {
        this.hierarchyService = hierarchyService;
    }
    buildForEmployee(employeeId) {
        return this.hierarchyService.buildForEmployee(employeeId);
    }
    rebuildAll() {
        return this.hierarchyService.rebuildAll();
    }
    getChain(employeeId) {
        return this.hierarchyService.getChain(employeeId);
    }
    getDirectReports(managerId) {
        return this.hierarchyService.getDirectReports(managerId);
    }
    getPendingApprovals(req) {
        return this.hierarchyService.getPendingApprovals(req.user.sub);
    }
    validateApproval(leaveRequestId, req) {
        return this.hierarchyService.validateApproval(leaveRequestId, req.user.sub);
    }
    getMyInfo(req) {
        return this.hierarchyService.getChain(req.user.sub);
    }
    getMyTeam(req) {
        return this.hierarchyService.getDirectReports(req.user.sub);
    }
};
exports.HierarchyController = HierarchyController;
__decorate([
    (0, common_1.Post)(':employeeId/build'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Build hierarchy entry for an employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "buildForEmployee", null);
__decorate([
    (0, common_1.Post)('rebuild-all'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Rebuild all hierarchy entries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "rebuildAll", null);
__decorate([
    (0, common_1.Get)(':employeeId/chain'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get full hierarchy chain for an employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "getChain", null);
__decorate([
    (0, common_1.Get)(':managerId/direct-reports'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get direct reports of a manager' }),
    __param(0, (0, common_1.Param)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "getDirectReports", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get leave requests pending my N+1 approval' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Post)(':leaveRequestId/validate-approval'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.MANAGER, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current user can approve a leave request' }),
    __param(0, (0, common_1.Param)('leaveRequestId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "validateApproval", null);
__decorate([
    (0, common_1.Get)('me/info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user hierarchy info' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "getMyInfo", null);
__decorate([
    (0, common_1.Get)('my-team'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my direct reports (team members)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HierarchyController.prototype, "getMyTeam", null);
exports.HierarchyController = HierarchyController = __decorate([
    (0, swagger_1.ApiTags)('🏢 Hierarchy (N+1)'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('hierarchy'),
    __metadata("design:paramtypes", [hierarchy_service_1.HierarchyService])
], HierarchyController);
//# sourceMappingURL=hierarchy.controller.js.map
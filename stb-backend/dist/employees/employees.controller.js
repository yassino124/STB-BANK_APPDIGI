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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const employees_service_1 = require("./employees.service");
const activity_logs_service_1 = require("../activity_logs/activity-logs.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const employee_dto_1 = require("./dto/employee.dto");
let EmployeesController = class EmployeesController {
    employeesService;
    activityLogsService;
    constructor(employeesService, activityLogsService) {
        this.employeesService = employeesService;
        this.activityLogsService = activityLogsService;
    }
    create(dto) {
        return this.employeesService.create(dto);
    }
    findAll(page = 1, limit = 20, search) {
        return this.employeesService.findAll(+page, +limit, search);
    }
    searchDirectory(query) {
        return this.employeesService.searchDirectory(query);
    }
    getStats() {
        return this.employeesService.getStats();
    }
    getMyActivityTimeline(req, limit = 20) {
        return this.activityLogsService.getMyActivityTimeline(req.user.userId || req.user._id, +limit);
    }
    async getAvatar(id, req) {
        const employee = await this.employeesService.findOne(id);
        if (!employee || !employee.avatar) {
            throw new Error('Avatar not found');
        }
        const base64Data = employee.avatar.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        req.res.setHeader('Content-Type', 'image/jpeg');
        req.res.setHeader('Content-Length', buffer.length);
        req.res.setHeader('Cache-Control', 'public, max-age=86400');
        return buffer;
    }
    getFinanceProfile(id) {
        return this.employeesService.getFinanceProfile(id);
    }
    findOne(id) {
        return this.employeesService.findOne(id);
    }
    updateRoles(id, dto) {
        return this.employeesService.updateRoles(id, dto);
    }
    updateStatus(id, dto) {
        return this.employeesService.updateStatus(id, dto);
    }
    updateFinancials(id, dto) {
        return this.employeesService.updateFinancials(id, dto);
    }
    updateAvatar(id, dto) {
        return this.employeesService.updateAvatar(id, dto);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: '➕ Create employee (RH only)',
        description: 'RH creates an employee account. Employee will need to self-activate via the app.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Employee created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Employee with same matricule/CIN/email already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: '📋 List all employees (paginated)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('directory/search'),
    (0, swagger_1.ApiOperation)({ summary: '🔍 Search employee directory (Accessible to all authenticated users)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String, description: 'Search query (min 2 chars)' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "searchDirectory", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '📊 Employee statistics dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('my/activity'),
    (0, swagger_1.ApiOperation)({ summary: '📜 Get my activity timeline (Transactions, Payroll, Leaves...)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getMyActivityTimeline", null);
__decorate([
    (0, common_1.Get)(':id/avatar'),
    (0, swagger_1.ApiOperation)({ summary: '🖼️ Get employee avatar as image' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getAvatar", null);
__decorate([
    (0, common_1.Get)(':id/finance-profile'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: '💰 Get employee finance profile with REAL calculations',
        description: 'Returns salaire net AFTER credit/avance deductions, not just raw data'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "getFinanceProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: '🔍 Get employee by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/roles'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: '🏷️ Update employee roles (RH only)',
        description: 'Assign or change roles: EMPLOYEE, RH, MANAGER, FINANCE, ADMIN, SUPER_ADMIN',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_dto_1.UpdateEmployeeRolesDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateRoles", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 Update employee status (activate/suspend/deactivate)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_dto_1.UpdateEmployeeStatusDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/financials'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: '💰 Update employee financials (Congés, Crédits, Prime)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_dto_1.UpdateEmployeeFinancialsDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateFinancials", null);
__decorate([
    (0, common_1.Patch)(':id/avatar'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: '🖼️ Update employee avatar',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_dto_1.UpdateEmployeeAvatarDto]),
    __metadata("design:returntype", void 0)
], EmployeesController.prototype, "updateAvatar", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, swagger_1.ApiTags)('👤 Employees'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService,
        activity_logs_service_1.ActivityLogsService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map
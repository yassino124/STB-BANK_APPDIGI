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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const finance_service_1 = require("./finance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const swagger_1 = require("@nestjs/swagger");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    createPayroll(req, dto) {
        return this.financeService.createPayroll(dto);
    }
    getPayrolls(req, employeeId, month, year) {
        return this.financeService.getPayrolls(employeeId, month, year);
    }
    getPayrollById(id) {
        return this.financeService.getPayrollById(id);
    }
    updatePayrollStatus(id, req, body) {
        return this.financeService.updatePayrollStatus(id, body.status, body.commentaire, req.user.sub);
    }
    createBudget(req, dto) {
        return this.financeService.createBudget(dto, req.user.sub);
    }
    getBudgets(req, department, status) {
        return this.financeService.getBudgets(department, status);
    }
    updateBudgetProgress(id, body) {
        return this.financeService.updateBudgetProgress(id, body);
    }
    updateBudgetStatus(id, req, body) {
        return this.financeService.updateBudgetStatus(id, body.status, body.commentaire, req.user.sub);
    }
    createInvestment(req, dto) {
        return this.financeService.createInvestment(dto);
    }
    getInvestments(req, employeeId, status) {
        return this.financeService.getInvestments(employeeId, status);
    }
    updateInvestmentStatus(id, req, body) {
        return this.financeService.updateInvestmentStatus(id, body.status, body.commentaire, req.user.sub);
    }
    getDashboardStats() {
        return this.financeService.getDashboardStats();
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)('payroll'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Create payroll entry' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createPayroll", null);
__decorate([
    (0, common_1.Get)('payroll'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payrolls' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPayrolls", null);
__decorate([
    (0, common_1.Get)('payroll/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPayrollById", null);
__decorate([
    (0, common_1.Patch)('payroll/:id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Update payroll status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updatePayrollStatus", null);
__decorate([
    (0, common_1.Post)('budgets'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Create budget' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createBudget", null);
__decorate([
    (0, common_1.Get)('budgets'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get all budgets' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('department')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getBudgets", null);
__decorate([
    (0, common_1.Patch)('budgets/:id/progress'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Update budget progress' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateBudgetProgress", null);
__decorate([
    (0, common_1.Patch)('budgets/:id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Update budget status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateBudgetStatus", null);
__decorate([
    (0, common_1.Post)('investments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Create investment' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createInvestment", null);
__decorate([
    (0, common_1.Get)('investments'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get all investments' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getInvestments", null);
__decorate([
    (0, common_1.Patch)('investments/:id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Update investment status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateInvestmentStatus", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get finance dashboard stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getDashboardStats", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('Finance Management'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map
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
exports.CreditsController = void 0;
const common_1 = require("@nestjs/common");
const credits_service_1 = require("./credits.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CreditsController = class CreditsController {
    creditsService;
    constructor(creditsService) {
        this.creditsService = creditsService;
    }
    create(req, dto) {
        return this.creditsService.create(req.user.sub, dto);
    }
    createForEmployee(employeeId, dto) {
        return this.creditsService.create(employeeId, dto);
    }
    getMine(req) {
        return this.creditsService.getMyCredits(req.user.sub);
    }
    getAll() {
        return this.creditsService.getAllCredits();
    }
    processMonthly() {
        return this.creditsService.processMonthlyCreditDeductions();
    }
    processPenalties() {
        return this.creditsService.processLatePaymentPenalties();
    }
    retryLatePayment(id) {
        return this.creditsService.retryLatePayment(id);
    }
    calculateEarlyRepayment(id) {
        return this.creditsService.calculateEarlyRepayment(id);
    }
    performEarlyRepayment(id) {
        return this.creditsService.performEarlyRepayment(id);
    }
    getAmortizationTable(id) {
        return this.creditsService.generateAmortizationTable(id);
    }
    getPaymentHistory(id) {
        return this.creditsService.getPaymentHistory(id);
    }
};
exports.CreditsController = CreditsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a credit for logged-in employee' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a credit for any employee (RH only)' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "createForEmployee", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'My credits' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'All credits (RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)('process-monthly'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger monthly credit deductions (cron or manual RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "processMonthly", null);
__decorate([
    (0, common_1.Post)('process-penalties'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply penalties to late credits (cron or manual RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "processPenalties", null);
__decorate([
    (0, common_1.Post)(':id/retry-late-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry payment for a late credit' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "retryLatePayment", null);
__decorate([
    (0, common_1.Get)(':id/early-repayment-calculation'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate early repayment amount and savings' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "calculateEarlyRepayment", null);
__decorate([
    (0, common_1.Post)(':id/early-repayment'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform early repayment of credit' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "performEarlyRepayment", null);
__decorate([
    (0, common_1.Get)(':id/amortization-table'),
    (0, swagger_1.ApiOperation)({ summary: 'Get amortization table for credit' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "getAmortizationTable", null);
__decorate([
    (0, common_1.Get)(':id/payment-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment history for credit' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CreditsController.prototype, "getPaymentHistory", null);
exports.CreditsController = CreditsController = __decorate([
    (0, swagger_1.ApiTags)('Credits'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('credits'),
    __metadata("design:paramtypes", [credits_service_1.CreditsService])
], CreditsController);
//# sourceMappingURL=credits.controller.js.map
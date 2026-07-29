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
exports.BillsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bills_service_1 = require("./bills.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BillsController = class BillsController {
    billsService;
    constructor(billsService) {
        this.billsService = billsService;
    }
    create(req, data) {
        const employeeId = data.employeeId || req.user?.sub;
        console.log('💳 Bill payment request:', { employeeId, data, user: req.user });
        if (!employeeId) {
            return {
                success: false,
                statusCode: 400,
                message: 'Employee ID required',
                debug: { receivedData: data, user: req.user }
            };
        }
        return this.billsService.create({ ...data, employeeId });
    }
    findByEmployee(req, employeeId) {
        const targetId = employeeId || req.user?.sub;
        console.log('💳 Bills list request:', { targetId, user: req.user });
        return this.billsService.findByEmployee(targetId);
    }
    findOne(id) {
        return this.billsService.findOne(id);
    }
    updateStatus(id, status) {
        return this.billsService.updateStatus(id, status);
    }
};
exports.BillsController = BillsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create/Pay bill' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List bills' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bill by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update bill status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "updateStatus", null);
exports.BillsController = BillsController = __decorate([
    (0, swagger_1.ApiTags)('📄 Bills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bills'),
    __metadata("design:paramtypes", [bills_service_1.BillsService])
], BillsController);
//# sourceMappingURL=bills.controller.js.map
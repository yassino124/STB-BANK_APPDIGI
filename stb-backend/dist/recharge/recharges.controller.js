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
exports.RechargesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recharges_service_1 = require("./recharges.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RechargesController = class RechargesController {
    rechargesService;
    constructor(rechargesService) {
        this.rechargesService = rechargesService;
    }
    create(req, data) {
        const employeeId = data.employeeId || req.user?.sub;
        console.log('📱 Recharge create request:', { employeeId, data, user: req.user });
        if (!employeeId) {
            return {
                success: false,
                statusCode: 400,
                message: 'Employee ID required',
                debug: { receivedData: data, user: req.user }
            };
        }
        return this.rechargesService.create({ ...data, employeeId });
    }
    findByEmployee(req, employeeId) {
        const targetId = employeeId || req.user?.sub;
        console.log('📱 Recharges list request:', { targetId, user: req.user });
        return this.rechargesService.findByEmployee(targetId);
    }
    findOne(id) {
        return this.rechargesService.findOne(id);
    }
};
exports.RechargesController = RechargesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create recharge' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List recharges' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recharge by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "findOne", null);
exports.RechargesController = RechargesController = __decorate([
    (0, swagger_1.ApiTags)('📱 Recharge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('recharges'),
    __metadata("design:paramtypes", [recharges_service_1.RechargesService])
], RechargesController);
//# sourceMappingURL=recharges.controller.js.map
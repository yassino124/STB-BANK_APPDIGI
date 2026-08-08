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
exports.CardsController = void 0;
const common_1 = require("@nestjs/common");
const cards_service_1 = require("./cards.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CardsController = class CardsController {
    cardsService;
    constructor(cardsService) {
        this.cardsService = cardsService;
    }
    getMine(req) {
        return this.cardsService.getMyCards(req.user.sub);
    }
    getAll() {
        return this.cardsService.getAllCards();
    }
    freeze(id) {
        return this.cardsService.freeze(id);
    }
    async createForEmployee(employeeId, body) {
        return this.cardsService.createForEmployeeWithoutAccountId(employeeId, body.type);
    }
    unfreeze(id) {
        return this.cardsService.unfreeze(id);
    }
    updateLimits(id, body) {
        return this.cardsService.updateLimits(id, { daily: body.limitQuotidien, monthly: body.limitMensuel });
    }
};
exports.CardsController = CardsController;
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'My cards' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'All cards (Agence)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Patch)(':id/freeze'),
    (0, swagger_1.ApiOperation)({ summary: 'Freeze card' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "freeze", null);
__decorate([
    (0, common_1.Post)('employee/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Create card for employee (RH)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CardsController.prototype, "createForEmployee", null);
__decorate([
    (0, common_1.Patch)(':id/unfreeze'),
    (0, swagger_1.ApiOperation)({ summary: 'Unfreeze card' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "unfreeze", null);
__decorate([
    (0, common_1.Patch)(':id/limit'),
    (0, swagger_1.ApiOperation)({ summary: 'Update card limits' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CardsController.prototype, "updateLimits", null);
exports.CardsController = CardsController = __decorate([
    (0, swagger_1.ApiTags)('Cards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cards'),
    __metadata("design:paramtypes", [cards_service_1.CardsService])
], CardsController);
//# sourceMappingURL=cards.controller.js.map
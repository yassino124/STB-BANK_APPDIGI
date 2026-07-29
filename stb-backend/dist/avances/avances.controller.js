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
exports.AvancesController = void 0;
const common_1 = require("@nestjs/common");
const avances_service_1 = require("./avances.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const avance_schema_1 = require("./schemas/avance.schema");
let AvancesController = class AvancesController {
    avancesService;
    constructor(avancesService) {
        this.avancesService = avancesService;
    }
    async create(req, body) {
        const avance = await this.avancesService.create(req.user.sub, body);
        return {
            success: true,
            message: 'Demande d\'avance créée avec succès',
            data: avance,
        };
    }
    async getMyAvances(req) {
        const avances = await this.avancesService.getMyAvances(req.user.sub);
        return {
            success: true,
            data: avances,
        };
    }
    async getAllAvances(statut, employeeId) {
        const avances = await this.avancesService.getAllAvances({ statut, employeeId });
        return {
            success: true,
            data: avances,
        };
    }
    async updateStatut(req, id, body) {
        const avance = await this.avancesService.updateStatut(id, body.statut, req.user.sub, body.rejectionReason);
        return {
            success: true,
            message: `Avance ${body.statut === avance_schema_1.AvanceStatut.APPROUVE ? 'approuvée' : 'refusée'}`,
            data: avance,
        };
    }
    async delete(req, id) {
        const result = await this.avancesService.delete(id, req.user.sub);
        return result;
    }
};
exports.AvancesController = AvancesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AvancesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AvancesController.prototype, "getMyAvances", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('statut')),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AvancesController.prototype, "getAllAvances", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AvancesController.prototype, "updateStatut", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AvancesController.prototype, "delete", null);
exports.AvancesController = AvancesController = __decorate([
    (0, common_1.Controller)('avances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [avances_service_1.AvancesService])
], AvancesController);
//# sourceMappingURL=avances.controller.js.map
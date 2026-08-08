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
exports.CongesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const conges_service_1 = require("./conges.service");
let CongesController = class CongesController {
    congesService;
    constructor(congesService) {
        this.congesService = congesService;
    }
    async createConge(req, body) {
        const employeeId = req.user.sub;
        const { type, startDate, endDate, motif } = body;
        if (!type || !startDate || !endDate) {
            throw new common_1.BadRequestException('Type, startDate et endDate requis');
        }
        const conge = await this.congesService.createCongeRequest(employeeId, type, new Date(startDate), new Date(endDate), motif);
        return {
            success: true,
            message: 'Demande de congé créée avec succès',
            data: conge,
        };
    }
    async getMyConges(req) {
        const employeeId = req.user.sub;
        const conges = await this.congesService.getMyConges(employeeId);
        return {
            success: true,
            data: conges,
        };
    }
    async getAllConges(statut, employeeId) {
        const conges = await this.congesService.getAllConges({ statut, employeeId });
        return {
            success: true,
            data: conges,
        };
    }
    async getPendingTeam(req) {
        const managerId = req.user.sub;
        const conges = await this.congesService.getPendingTeam(managerId);
        return {
            success: true,
            data: conges,
        };
    }
    async getTeamCalendar(req, month, year) {
        const managerId = req.user.sub;
        if (!month || !year) {
            throw new common_1.BadRequestException('month et year requis');
        }
        const conges = await this.congesService.getTeamCalendar(managerId, parseInt(month), parseInt(year));
        return {
            success: true,
            data: conges,
        };
    }
    async approveConge(req, congeId, body) {
        const approverId = req.user.sub;
        const { role } = body;
        if (!role) {
            throw new common_1.BadRequestException('Role requis (MANAGER, RH, DG)');
        }
        const conge = await this.congesService.approveConge(congeId, approverId, role);
        return {
            success: true,
            message: `Congé approuvé par ${role}`,
            data: conge,
        };
    }
    async refuseConge(req, congeId, body) {
        const { reason } = body;
        if (!reason) {
            throw new common_1.BadRequestException('Raison de refus requise');
        }
        const conge = await this.congesService.refuseConge(congeId, reason);
        return {
            success: true,
            message: 'Congé refusé',
            data: conge,
        };
    }
    async updateStatut(req, congeId, body) {
        const approverId = req.user.sub;
        const { statut, rejectionReason } = body;
        if (statut === 'APPROUVE') {
            const role = (req.user.roles || []).includes('MANAGER') ? 'MANAGER' : 'RH';
            const conge = await this.congesService.approveConge(congeId, approverId, role);
            return {
                success: true,
                message: 'Congé approuvé',
                data: conge,
            };
        }
        else if (statut === 'REFUSE') {
            const conge = await this.congesService.refuseConge(congeId, rejectionReason || 'Refusé');
            return {
                success: true,
                message: 'Congé refusé',
                data: conge,
            };
        }
        else {
            throw new common_1.BadRequestException('Statut invalide');
        }
    }
    async uploadJustificatif(congeId, file) {
        if (!file) {
            throw new common_1.BadRequestException('Fichier requis');
        }
        const fileData = {
            filename: file.originalname,
            url: `/uploads/conges/${congeId}/${file.originalname}`,
            mimetype: file.mimetype,
        };
        const conge = await this.congesService.uploadJustificatif(congeId, fileData);
        return {
            success: true,
            message: 'Justificatif uploadé avec succès',
            data: conge,
        };
    }
    async getCongesStats() {
        return {
            success: true,
            data: {
                totalEnAttente: 0,
                totalApprouve: 0,
                totalRefuse: 0,
            },
        };
    }
};
exports.CongesController = CongesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "createConge", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "getMyConges", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('statut')),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "getAllConges", null);
__decorate([
    (0, common_1.Get)('pending-team'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "getPendingTeam", null);
__decorate([
    (0, common_1.Get)('team-calendar'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "getTeamCalendar", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "approveConge", null);
__decorate([
    (0, common_1.Patch)(':id/refuse'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "refuseConge", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "updateStatut", null);
__decorate([
    (0, common_1.Post)(':id/justificatif'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "uploadJustificatif", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CongesController.prototype, "getCongesStats", null);
exports.CongesController = CongesController = __decorate([
    (0, common_1.Controller)('conges'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [conges_service_1.CongesService])
], CongesController);
//# sourceMappingURL=conges.controller.js.map
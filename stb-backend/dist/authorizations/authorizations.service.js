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
exports.AuthorizationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const authorization_schema_1 = require("./schemas/authorization.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let AuthorizationsService = class AuthorizationsService {
    authModel;
    notificationsService;
    constructor(authModel, notificationsService) {
        this.authModel = authModel;
        this.notificationsService = notificationsService;
    }
    async create(employeeId, dto) {
        return this.authModel.create({ employeeId: new mongoose_2.Types.ObjectId(employeeId), ...dto, type: dto.type, status: authorization_schema_1.AuthorizationStatus.PENDING });
    }
    async getMine(employeeId) {
        return this.authModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async getAll(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.authModel.find(filter).populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
    }
    async handle(id, approverId, decision, commentaire = '') {
        const auth = await this.authModel.findById(id).exec();
        if (!auth)
            throw new Error('Authorization introuvable');
        auth.status = decision === 'APPROVED' ? authorization_schema_1.AuthorizationStatus.APPROVED : authorization_schema_1.AuthorizationStatus.REJECTED;
        auth.approvedBy = new mongoose_2.Types.ObjectId(approverId);
        auth.commentaire = commentaire;
        await auth.save();
        await this.notificationsService.sendToEmployee(auth.employeeId.toString(), decision === 'APPROVED' ? '✅ Autorisation approuvée' : '❌ Autorisation refusée', `Votre demande d'autorisation a été ${decision === 'APPROVED' ? 'approuvée' : 'refusée'}.`, notification_schema_1.NotificationType.HR_REQUEST);
        return auth;
    }
};
exports.AuthorizationsService = AuthorizationsService;
exports.AuthorizationsService = AuthorizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(authorization_schema_1.Authorization.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_service_1.NotificationsService])
], AuthorizationsService);
//# sourceMappingURL=authorizations.service.js.map
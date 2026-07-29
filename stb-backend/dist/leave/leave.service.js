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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const leave_schema_1 = require("./schemas/leave.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const hierarchy_service_1 = require("../hierarchy/hierarchy.service");
let LeaveService = class LeaveService {
    leaveRequestModel;
    leaveBalanceModel;
    notificationsService;
    hierarchyService;
    constructor(leaveRequestModel, leaveBalanceModel, notificationsService, hierarchyService) {
        this.leaveRequestModel = leaveRequestModel;
        this.leaveBalanceModel = leaveBalanceModel;
        this.notificationsService = notificationsService;
        this.hierarchyService = hierarchyService;
    }
    async createRequest(employeeId, dto) {
        const dateDebut = new Date(dto.dateDebut);
        const dateFin = new Date(dto.dateFin);
        const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
        const nombreJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const balance = await this.getOrCreateBalance(employeeId);
        const soldeDisponible = balance.soldeAnnuel - balance.soldeUtilise;
        if (nombreJours > soldeDisponible) {
            throw new common_1.BadRequestException(`Solde insuffisant. Disponible: ${soldeDisponible} jours`);
        }
        const employee = await this.hierarchyService.buildForEmployee(employeeId);
        const managerId = employee.managerId;
        const createData = {
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            dateDebut,
            dateFin,
            nombreJours,
            motif: dto.motif,
            status: leave_schema_1.LeaveStatus.PENDING_N1,
        };
        if (managerId) {
            createData.managerId = new mongoose_2.Types.ObjectId(managerId.toString());
        }
        return this.leaveRequestModel.create(createData);
    }
    async getMyRequests(employeeId) {
        return this.leaveRequestModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async getPendingForManager(managerId) {
        return this.leaveRequestModel
            .find({
            managerId: new mongoose_2.Types.ObjectId(managerId),
            status: leave_schema_1.LeaveStatus.PENDING_N1,
        })
            .populate('employeeId', 'nom prenom matricule poste department soldeConges')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getMyTeamRequests(managerId) {
        const directReports = await this.hierarchyService.getDirectReports(managerId);
        const reportIds = directReports.map((dr) => dr.employeeId);
        return this.leaveRequestModel
            .find({ employeeId: { $in: reportIds } })
            .sort({ createdAt: -1 })
            .exec();
    }
    async handleManagerApproval(id, managerId, decision, commentaire = '') {
        const request = await this.leaveRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Demande de congé introuvable');
        const isN1 = request.managerId?.toString() === managerId;
        if (!isN1) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas le N+1 de cet employé');
        }
        if (request.status !== leave_schema_1.LeaveStatus.PENDING_N1) {
            throw new common_1.BadRequestException(`Demande déjà traitée. Statut actuel: ${request.status}`);
        }
        if (decision === 'APPROVED') {
            request.status = leave_schema_1.LeaveStatus.APPROVED_N1;
            request.n1ApprovedBy = new mongoose_2.Types.ObjectId(managerId);
            request.n1ApprovedAt = new Date();
            request.n1Commentaire = commentaire;
            request.validatedBy = new mongoose_2.Types.ObjectId(managerId);
            request.validatedAt = new Date();
            await this.notificationsService.sendToEmployee(request.employeeId.toString(), '✅ Congé approuvé par votre N+1', `Votre demande de congé du ${request.dateDebut.toLocaleDateString('fr-FR')} est approuvée par votre manager. En attente de validation RH.`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        else {
            request.status = leave_schema_1.LeaveStatus.REJECTED;
            request.n1Commentaire = commentaire;
            request.commentaire = commentaire;
            request.validatedBy = new mongoose_2.Types.ObjectId(managerId);
            request.validatedAt = new Date();
            await this.notificationsService.sendToEmployee(request.employeeId.toString(), '❌ Congé refusé par votre manager', `Votre demande de congé a été refusée. ${commentaire}`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        return request.save();
    }
    async handleRhApproval(id, rhId, decision, commentaire = '') {
        const request = await this.leaveRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Demande de congé introuvable');
        if (request.status !== leave_schema_1.LeaveStatus.PENDING_RH && request.status !== leave_schema_1.LeaveStatus.APPROVED_N1) {
            throw new common_1.BadRequestException(`Demande ne peut pas être traitée par la RH. Statut: ${request.status}`);
        }
        if (decision === 'APPROVED') {
            request.status = leave_schema_1.LeaveStatus.APPROVED;
            request.rhApprovedBy = new mongoose_2.Types.ObjectId(rhId);
            request.rhApprovedAt = new Date();
            request.rhCommentaire = commentaire;
            request.validatedBy = new mongoose_2.Types.ObjectId(rhId);
            request.validatedAt = new Date();
            const balance = await this.getOrCreateBalance(request.employeeId.toString());
            balance.soldeUtilise += request.nombreJours;
            await balance.save();
            await this.notificationsService.sendToEmployee(request.employeeId.toString(), '✅ Congé validé', `Votre demande de congé du ${request.dateDebut.toLocaleDateString('fr-FR')} est maintenant entièrement validée. Solde mis à jour.`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        else {
            request.status = leave_schema_1.LeaveStatus.REJECTED;
            request.rhCommentaire = commentaire;
            request.commentaire = commentaire;
            request.validatedBy = new mongoose_2.Types.ObjectId(rhId);
            request.validatedAt = new Date();
            await this.notificationsService.sendToEmployee(request.employeeId.toString(), '❌ Congé refusé par les RH', `Votre demande de congé a été refusée par les RH. ${commentaire}`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        return request.save();
    }
    async getAllRequests(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.leaveRequestModel.find(filter).populate('employeeId', 'nom prenom matricule departement').sort({ createdAt: -1 }).exec();
    }
    async getMyBalance(employeeId) {
        return this.getOrCreateBalance(employeeId);
    }
    async addMonthlyBalance(days = 7.5) {
        return this.leaveBalanceModel.updateMany({}, { $inc: { soldeAnnuel: days } }).exec();
    }
    async updateBalance(employeeId, days) {
        const balance = await this.getOrCreateBalance(employeeId);
        balance.soldeAnnuel = Math.round((balance.soldeAnnuel + days) * 100) / 100;
        await balance.save();
        return balance;
    }
    async getOrCreateBalance(employeeId) {
        let balance = await this.leaveBalanceModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        if (!balance) {
            balance = await this.leaveBalanceModel.create({
                employeeId: new mongoose_2.Types.ObjectId(employeeId),
                soldeAnnuel: 90,
                soldeUtilise: 0,
            });
        }
        return balance;
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(leave_schema_1.LeaveRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(leave_schema_1.LeaveBalance.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        hierarchy_service_1.HierarchyService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map
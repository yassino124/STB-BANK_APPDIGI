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
const employee_schema_1 = require("../employees/employee.schema");
let LeaveService = class LeaveService {
    leaveRequestModel;
    leaveBalanceModel;
    employeeModel;
    notificationsService;
    hierarchyService;
    constructor(leaveRequestModel, leaveBalanceModel, employeeModel, notificationsService, hierarchyService) {
        this.leaveRequestModel = leaveRequestModel;
        this.leaveBalanceModel = leaveBalanceModel;
        this.employeeModel = employeeModel;
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
        const employee = await this.employeeModel.findById(employeeId).populate('managerId directorId centralDirectorId').exec();
        if (!employee)
            throw new common_1.BadRequestException('Employé introuvable');
        const approvalHistory = [];
        const approvalChain = [];
        if (employee.managerId) {
            const manager = employee.managerId;
            approvalChain.push(manager._id.toString());
            approvalHistory.push({
                approverId: manager._id,
                approverName: `${manager.nom} ${manager.prenom}`,
                level: 1,
                decision: 'PENDING',
            });
        }
        if (employee.directorId) {
            const director = employee.directorId;
            approvalChain.push(director._id.toString());
            approvalHistory.push({
                approverId: director._id,
                approverName: `${director.nom} ${director.prenom}`,
                level: 2,
                decision: 'PENDING',
            });
        }
        if (employee.centralDirectorId) {
            const centralDirector = employee.centralDirectorId;
            approvalChain.push(centralDirector._id.toString());
            approvalHistory.push({
                approverId: centralDirector._id,
                approverName: `${centralDirector.nom} ${centralDirector.prenom}`,
                level: 3,
                decision: 'PENDING',
            });
        }
        const hasManagers = approvalChain.length > 0;
        const initialStatus = hasManagers ? leave_schema_1.LeaveStatus.PENDING_MANAGER : leave_schema_1.LeaveStatus.PENDING_RH;
        const initialApprover = hasManagers ? new mongoose_2.Types.ObjectId(approvalChain[0]) : null;
        const createData = {
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            dateDebut,
            dateFin,
            nombreJours,
            motif: dto.motif,
            status: initialStatus,
            currentApproverId: initialApprover,
            approvalHistory: approvalHistory,
        };
        if (employee.managerId) {
            const manager = employee.managerId;
            createData.managerId = new mongoose_2.Types.ObjectId(manager._id.toString());
        }
        return this.leaveRequestModel.create(createData);
    }
    async getMyRequests(employeeId) {
        return this.leaveRequestModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async getPendingForManager(managerId) {
        return this.leaveRequestModel
            .find({
            currentApproverId: { $in: [managerId, new mongoose_2.Types.ObjectId(managerId)] },
            status: leave_schema_1.LeaveStatus.PENDING_MANAGER,
        })
            .populate('employeeId', 'nom prenom matricule poste department soldeConges avatar')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getMyTeamRequests(managerId) {
        const managerIdQuery = { $in: [managerId, new mongoose_2.Types.ObjectId(managerId)] };
        const subordinates = await this.employeeModel
            .find({
            $or: [
                { managerId: managerIdQuery },
                { directorId: managerIdQuery },
                { centralDirectorId: managerIdQuery }
            ]
        })
            .select('_id')
            .exec();
        const subordinateIds = subordinates.map((e) => e._id);
        return this.leaveRequestModel
            .find({
            $or: [
                { employeeId: { $in: subordinateIds } },
                { currentApproverId: new mongoose_2.Types.ObjectId(managerId) }
            ]
        })
            .populate('employeeId', 'nom prenom matricule poste avatar')
            .sort({ createdAt: -1 })
            .exec();
    }
    async handleManagerApproval(id, managerId, decision, commentaire = '') {
        const request = await this.leaveRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Demande de congé introuvable');
        if (request.status !== leave_schema_1.LeaveStatus.PENDING_MANAGER) {
            throw new common_1.BadRequestException(`Demande déjà traitée. Statut actuel: ${request.status}`);
        }
        const historyStepIndex = request.approvalHistory.findIndex(h => h.approverId?.toString() === managerId);
        if (historyStepIndex === -1) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas dans la chaîne de validation de cette demande');
        }
        const historyStep = request.approvalHistory[historyStepIndex];
        if (decision === 'APPROVED') {
            request.approvalHistory[historyStepIndex].decision = 'APPROVED';
            request.approvalHistory[historyStepIndex].date = new Date();
            request.approvalHistory[historyStepIndex].comment = commentaire;
            request.markModified('approvalHistory');
            const nextStep = request.approvalHistory.find(h => h.level > historyStep.level && h.decision === 'PENDING');
            if (nextStep) {
                request.currentApproverId = new mongoose_2.Types.ObjectId(nextStep.approverId.toString());
                await this.notificationsService.sendToEmployee(request.employeeId.toString(), `✅ Validé par ${historyStep.approverName}`, `Votre demande est maintenant en attente de validation par ${nextStep.approverName}.`, notification_schema_1.NotificationType.HR_REQUEST);
            }
            else {
                request.status = leave_schema_1.LeaveStatus.PENDING_RH;
                request.currentApproverId = null;
                await this.notificationsService.sendToEmployee(request.employeeId.toString(), `✅ Validation managers terminée`, `Votre demande de congé a passé l'étape manager. En attente de validation finale des RH.`, notification_schema_1.NotificationType.HR_REQUEST);
            }
        }
        else {
            request.status = leave_schema_1.LeaveStatus.REJECTED;
            request.currentApproverId = null;
            request.approvalHistory[historyStepIndex].decision = 'REJECTED';
            request.approvalHistory[historyStepIndex].date = new Date();
            request.approvalHistory[historyStepIndex].comment = commentaire;
            request.markModified('approvalHistory');
            request.commentaire = commentaire;
            await this.notificationsService.sendToEmployee(request.employeeId.toString(), `❌ Congé refusé par ${historyStep.approverName}`, `Votre demande de congé a été refusée. ${commentaire}`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        return request.save();
    }
    async handleRhApproval(id, rhId, decision, commentaire = '') {
        const request = await this.leaveRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Demande de congé introuvable');
        if (request.status !== leave_schema_1.LeaveStatus.PENDING_RH) {
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
            const soldeDisponible = balance.soldeAnnuel - balance.soldeUtilise;
            await this.employeeModel.updateOne({ _id: request.employeeId }, { $set: { soldeConges: soldeDisponible } }).exec();
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
        return this.leaveRequestModel.find(filter).populate('employeeId', 'nom prenom matricule departement avatar').sort({ createdAt: -1 }).exec();
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
                soldeAnnuel: 30,
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
    __param(2, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        hierarchy_service_1.HierarchyService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map
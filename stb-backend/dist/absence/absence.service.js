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
exports.AbsenceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const absence_schema_1 = require("./schemas/absence.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let AbsenceService = class AbsenceService {
    absenceModel;
    employeeModel;
    notificationsService;
    constructor(absenceModel, employeeModel, notificationsService) {
        this.absenceModel = absenceModel;
        this.employeeModel = employeeModel;
        this.notificationsService = notificationsService;
    }
    async create(employeeId, dto) {
        const employee = await this.employeeModel
            .findById(employeeId)
            .populate('managerId directorId centralDirectorId')
            .exec();
        if (!employee) {
            throw new common_1.NotFoundException('Employé non trouvé');
        }
        if (dto.nombreHeures > 2) {
            throw new common_1.BadRequestException('Une absence ne peut pas dépasser 2 heures par mois');
        }
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
        if (approvalChain.length === 0) {
            throw new common_1.BadRequestException('Aucun manager assigné à cet employé');
        }
        const hasManagers = approvalChain.length > 0;
        const initialApproverId = hasManagers ? new mongoose_2.Types.ObjectId(approvalChain[0]) : null;
        const absence = new this.absenceModel({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            dateDebut: dto.dateDebut,
            dateFin: dto.dateFin,
            nombreHeures: dto.nombreHeures,
            motif: dto.motif || '',
            pieceJointe: dto.pieceJointe || null,
            status: absence_schema_1.AbsenceStatus.PENDING_N1,
            managerId: initialApproverId,
            currentApproverId: initialApproverId,
            approvalHistory,
        });
        const saved = await absence.save();
        if (initialApproverId) {
            await this.notificationsService.sendToEmployee(initialApproverId.toString(), `📋 Nouvelle demande d'absence`, `${employee.nom} ${employee.prenom} a soumis une demande d'absence de ${dto.nombreHeures}h.`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        return saved;
    }
    async getMyAbsences(employeeId) {
        return this.absenceModel
            .find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getPendingForManager(managerId) {
        return this.absenceModel
            .find({
            currentApproverId: new mongoose_2.Types.ObjectId(managerId),
            status: absence_schema_1.AbsenceStatus.PENDING_N1,
        })
            .populate('employeeId', 'nom prenom matricule poste avatar')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getMyTeamAbsences(managerId) {
        const managerIdObj = new mongoose_2.Types.ObjectId(managerId);
        const subordinates = await this.employeeModel
            .find({
            $or: [
                { managerId: managerIdObj },
                { directorId: managerIdObj },
                { centralDirectorId: managerIdObj },
            ],
        })
            .select('_id')
            .exec();
        const subordinateIds = subordinates.map((e) => e._id);
        return this.absenceModel
            .find({
            $or: [
                { employeeId: { $in: subordinateIds } },
                { currentApproverId: managerIdObj },
            ],
        })
            .populate('employeeId', 'nom prenom matricule poste avatar')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getPendingForRh() {
        return this.absenceModel
            .find({ status: absence_schema_1.AbsenceStatus.APPROVED_N1 })
            .populate('employeeId', 'nom prenom matricule poste')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAll(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.absenceModel
            .find(filter)
            .populate('employeeId', 'nom prenom matricule poste')
            .sort({ createdAt: -1 })
            .exec();
    }
    async handleManagerApproval(absenceId, managerId, decision, commentaire) {
        const absence = await this.absenceModel.findById(absenceId);
        if (!absence)
            throw new common_1.NotFoundException("Demande d'absence non trouvée");
        if (absence.status !== absence_schema_1.AbsenceStatus.PENDING_N1) {
            throw new common_1.BadRequestException(`Statut invalide: ${absence.status}`);
        }
        const stepIndex = absence.approvalHistory.findIndex((h) => h.approverId?.toString() === managerId);
        if (stepIndex === -1) {
            throw new common_1.ForbiddenException("Vous n'êtes pas dans la chaîne de validation de cette demande");
        }
        const currentStep = absence.approvalHistory[stepIndex];
        if (decision === 'APPROVED') {
            currentStep.decision = 'APPROVED';
            currentStep.date = new Date();
            currentStep.comment = commentaire || '';
            absence.markModified('approvalHistory');
            const nextStep = absence.approvalHistory.find((h) => h.level > currentStep.level && h.decision === 'PENDING');
            if (nextStep) {
                absence.currentApproverId = new mongoose_2.Types.ObjectId(nextStep.approverId.toString());
                await this.notificationsService.sendToEmployee(absence.employeeId.toString(), `✅ Validé par ${currentStep.approverName}`, `Votre demande est maintenant en attente de ${nextStep.approverName}.`, notification_schema_1.NotificationType.HR_REQUEST);
            }
            else {
                absence.status = absence_schema_1.AbsenceStatus.APPROVED_N1;
                absence.currentApproverId = null;
                await this.notificationsService.sendToEmployee(absence.employeeId.toString(), `✅ Approuvée par tous les managers`, `Votre demande d'absence est maintenant en attente de validation RH.`, notification_schema_1.NotificationType.HR_REQUEST);
            }
        }
        else {
            currentStep.decision = 'REJECTED';
            currentStep.date = new Date();
            currentStep.comment = commentaire || 'Refusé';
            absence.markModified('approvalHistory');
            absence.status = absence_schema_1.AbsenceStatus.REJECTED;
            absence.commentaire = commentaire || 'Refusé par le manager';
            await this.notificationsService.sendToEmployee(absence.employeeId.toString(), `❌ Demande d'absence refusée`, commentaire || 'Votre demande a été refusée par votre manager.', notification_schema_1.NotificationType.HR_REQUEST);
        }
        return absence.save();
    }
    async handleRhApproval(absenceId, rhId, decision, commentaire) {
        const absence = await this.absenceModel.findById(absenceId);
        if (!absence)
            throw new common_1.NotFoundException("Demande d'absence non trouvée");
        if (absence.status !== absence_schema_1.AbsenceStatus.APPROVED_N1) {
            throw new common_1.BadRequestException(`Seules les demandes APPROVED_N1 peuvent être validées par RH. Statut: ${absence.status}`);
        }
        if (decision === 'APPROVED') {
            absence.status = absence_schema_1.AbsenceStatus.APPROVED;
            absence.rhApprovedBy = new mongoose_2.Types.ObjectId(rhId);
            absence.rhApprovedAt = new Date();
            absence.rhCommentaire = commentaire || '';
            absence.validatedBy = new mongoose_2.Types.ObjectId(rhId);
            absence.validatedAt = new Date();
            absence.commentaire = commentaire || 'Validé par RH';
            await this.notificationsService.sendToEmployee(absence.employeeId.toString(), `✅ Absence approuvée`, `Votre demande d'absence a été approuvée par les Ressources Humaines.`, notification_schema_1.NotificationType.HR_REQUEST);
        }
        else {
            absence.status = absence_schema_1.AbsenceStatus.REJECTED;
            absence.rhCommentaire = commentaire || 'Refusé par RH';
            absence.validatedBy = new mongoose_2.Types.ObjectId(rhId);
            absence.validatedAt = new Date();
            absence.commentaire = commentaire || 'Refusé par RH';
            await this.notificationsService.sendToEmployee(absence.employeeId.toString(), `❌ Absence refusée par RH`, commentaire || 'Votre demande a été refusée par les Ressources Humaines.', notification_schema_1.NotificationType.HR_REQUEST);
        }
        return absence.save();
    }
    async cancel(absenceId, employeeId) {
        const absence = await this.absenceModel.findById(absenceId);
        if (!absence)
            throw new common_1.NotFoundException("Demande d'absence non trouvée");
        if (absence.employeeId.toString() !== employeeId) {
            throw new common_1.BadRequestException('Vous ne pouvez annuler que votre propre demande');
        }
        if (absence.status !== absence_schema_1.AbsenceStatus.PENDING_N1) {
            throw new common_1.BadRequestException('Seules les demandes PENDING_N1 peuvent être annulées');
        }
        absence.status = absence_schema_1.AbsenceStatus.CANCELLED;
        absence.commentaire = "Annulée par l'employé";
        return absence.save();
    }
};
exports.AbsenceService = AbsenceService;
exports.AbsenceService = AbsenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(absence_schema_1.Absence.name)),
    __param(1, (0, mongoose_1.InjectModel)('Employee')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], AbsenceService);
//# sourceMappingURL=absence.service.js.map
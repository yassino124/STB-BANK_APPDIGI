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
let AbsenceService = class AbsenceService {
    absenceModel;
    employeeModel;
    constructor(absenceModel, employeeModel) {
        this.absenceModel = absenceModel;
        this.employeeModel = employeeModel;
    }
    async create(employeeId, dto) {
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('Employé non trouvé');
        }
        if (dto.nombreHeures > 2) {
            throw new common_1.BadRequestException('Une absence ne peut pas dépasser 2 heures par mois');
        }
        const managerId = employee.managerId;
        if (!managerId) {
            throw new common_1.BadRequestException('Aucun manager assigné à cet employé');
        }
        const absence = new this.absenceModel({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            dateDebut: dto.dateDebut,
            dateFin: dto.dateFin,
            nombreHeures: dto.nombreHeures,
            motif: dto.motif || '',
            pieceJointe: dto.pieceJointe || null,
            status: absence_schema_1.AbsenceStatus.PENDING_N1,
            managerId: new mongoose_2.Types.ObjectId(managerId),
        });
        return absence.save();
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
            managerId: new mongoose_2.Types.ObjectId(managerId),
            status: absence_schema_1.AbsenceStatus.PENDING_N1,
        })
            .populate('employeeId', 'nom prenom matricule poste')
            .exec();
    }
    async getPendingForRh() {
        return this.absenceModel
            .find({ status: absence_schema_1.AbsenceStatus.APPROVED_N1 })
            .populate('employeeId', 'nom prenom matricule poste')
            .populate('n1ApprovedBy', 'nom prenom matricule')
            .exec();
    }
    async getAll(status) {
        const filter = {};
        if (status) {
            filter.status = status;
        }
        return this.absenceModel
            .find(filter)
            .populate('employeeId', 'nom prenom matricule poste')
            .sort({ createdAt: -1 })
            .exec();
    }
    async handleManagerApproval(absenceId, managerId, decision, commentaire) {
        const absence = await this.absenceModel.findById(absenceId);
        if (!absence) {
            throw new common_1.NotFoundException('Demande d\'absence non trouvée');
        }
        if (absence.status !== absence_schema_1.AbsenceStatus.PENDING_N1) {
            throw new common_1.BadRequestException(`Statut invalide: ${absence.status}`);
        }
        if (absence.managerId.toString() !== managerId) {
            throw new common_1.BadRequestException('Vous n\'êtes pas le manager de cette demande');
        }
        if (decision === 'APPROVED') {
            absence.status = absence_schema_1.AbsenceStatus.APPROVED_N1;
            absence.n1ApprovedBy = new mongoose_2.Types.ObjectId(managerId);
            absence.n1ApprovedAt = new Date();
            absence.n1Commentaire = commentaire || '';
        }
        else {
            absence.status = absence_schema_1.AbsenceStatus.REJECTED;
            absence.n1Commentaire = commentaire || 'Sans motif';
            absence.validatedBy = new mongoose_2.Types.ObjectId(managerId);
            absence.validatedAt = new Date();
            absence.commentaire = commentaire || 'Refusé par le manager';
        }
        return absence.save();
    }
    async handleRhApproval(absenceId, rhId, decision, commentaire) {
        const absence = await this.absenceModel.findById(absenceId);
        if (!absence) {
            throw new common_1.NotFoundException('Demande d\'absence non trouvée');
        }
        if (absence.status !== absence_schema_1.AbsenceStatus.APPROVED_N1) {
            throw new common_1.BadRequestException(`Seules les demandes APPROVED_N1 peuvent être validées par RH. Statut actuel: ${absence.status}`);
        }
        if (decision === 'APPROVED') {
            absence.status = absence_schema_1.AbsenceStatus.APPROVED;
            absence.rhApprovedBy = new mongoose_2.Types.ObjectId(rhId);
            absence.rhApprovedAt = new Date();
            absence.rhCommentaire = commentaire || '';
            absence.validatedBy = new mongoose_2.Types.ObjectId(rhId);
            absence.validatedAt = new Date();
            absence.commentaire = commentaire || 'Validé par RH';
        }
        else {
            absence.status = absence_schema_1.AbsenceStatus.REJECTED;
            absence.rhCommentaire = commentaire || 'Refusé par RH';
            absence.validatedBy = new mongoose_2.Types.ObjectId(rhId);
            absence.validatedAt = new Date();
            absence.commentaire = commentaire || 'Refusé par RH';
        }
        return absence.save();
    }
    async cancel(absenceId, employeeId) {
        const absence = await this.absenceModel.findById(absenceId);
        if (!absence) {
            throw new common_1.NotFoundException('Demande d\'absence non trouvée');
        }
        if (absence.employeeId.toString() !== employeeId) {
            throw new common_1.BadRequestException('Vous ne pouvez annuler que votre propre demande');
        }
        if (absence.status !== absence_schema_1.AbsenceStatus.PENDING_N1) {
            throw new common_1.BadRequestException('Seules les demandes PENDING_N1 peuvent être annulées');
        }
        absence.status = absence_schema_1.AbsenceStatus.CANCELLED;
        absence.commentaire = 'Annulée par l\'employé';
        return absence.save();
    }
};
exports.AbsenceService = AbsenceService;
exports.AbsenceService = AbsenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(absence_schema_1.Absence.name)),
    __param(1, (0, mongoose_1.InjectModel)('Employee')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AbsenceService);
//# sourceMappingURL=absence.service.js.map
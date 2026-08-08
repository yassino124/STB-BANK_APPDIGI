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
exports.AvancesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const avance_schema_1 = require("./schemas/avance.schema");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let AvancesService = class AvancesService {
    avanceModel;
    employeeModel;
    accountModel;
    transactionModel;
    notificationsService;
    constructor(avanceModel, employeeModel, accountModel, transactionModel, notificationsService) {
        this.avanceModel = avanceModel;
        this.employeeModel = employeeModel;
        this.accountModel = accountModel;
        this.transactionModel = transactionModel;
        this.notificationsService = notificationsService;
    }
    async create(employeeId, data) {
        console.log('🔍 Creating avance for employeeId:', employeeId);
        const employee = await this.employeeModel.findById(employeeId).exec();
        console.log('✅ Employee found:', employee ? `${employee.prenom} ${employee.nom}` : 'NULL');
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        if (data.type === avance_schema_1.AvanceType.SALAIRE) {
            const maxAvance = employee.salaireBase * 0.5;
            if (data.montant > maxAvance) {
                throw new common_1.BadRequestException(`Montant trop élevé. Maximum autorisé: ${maxAvance.toFixed(2)} TND (50% du salaire)`);
            }
        }
        const avance = await this.avanceModel.create({
            employee: new mongoose_2.Types.ObjectId(employeeId),
            type: data.type,
            montant: data.montant,
            motif: data.motif || null,
            statut: avance_schema_1.AvanceStatut.EN_ATTENTE,
        });
        await this.notificationsService.sendToEmployee(employeeId, '✅ Demande d\'avance soumise', `Votre demande d'avance de ${data.montant} TND (${data.type}) a été envoyée pour validation.`, notification_schema_1.NotificationType.TRANSACTION);
        return avance;
    }
    async getMyAvances(employeeId) {
        return this.avanceModel
            .find({ employee: new mongoose_2.Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAllAvances(filters) {
        const query = {};
        if (filters?.statut) {
            query.statut = filters.statut;
        }
        if (filters?.employeeId) {
            query.employee = new mongoose_2.Types.ObjectId(filters.employeeId);
        }
        return this.avanceModel
            .find(query)
            .populate('employee', 'matricule nom prenom email avatar')
            .populate('approvedBy', 'nom prenom')
            .sort({ createdAt: -1 })
            .exec();
    }
    async updateStatut(avanceId, statut, approvedById, rejectionReason) {
        const avance = await this.avanceModel.findById(avanceId).exec();
        if (!avance) {
            throw new common_1.NotFoundException('Avance introuvable');
        }
        if (avance.statut !== avance_schema_1.AvanceStatut.EN_ATTENTE) {
            throw new common_1.BadRequestException('Cette avance a déjà été traitée');
        }
        avance.statut = statut;
        if (statut === avance_schema_1.AvanceStatut.APPROUVE && approvedById) {
            avance.approvedBy = new mongoose_2.Types.ObjectId(approvedById);
            avance.approvedAt = new Date();
            await this.employeeModel.findByIdAndUpdate(avance.employee, {
                $inc: { avancesEnCours: avance.montant }
            }).exec();
            const account = await this.accountModel.findOne({
                employeeId: avance.employee,
                isPrimary: true,
            }).exec();
            if (account) {
                await this.accountModel.findByIdAndUpdate(account._id, {
                    $inc: { solde: avance.montant }
                }).exec();
                const reference = `AVN-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
                await this.transactionModel.create({
                    employeeId: avance.employee,
                    accountId: account._id,
                    montant: avance.montant,
                    type: transaction_schema_1.TransactionType.AVANCE,
                    description: `Avance ${avance.type} approuvée`,
                    status: transaction_schema_1.TransactionStatus.COMPLETED,
                    date: new Date(),
                    reference,
                    category: transaction_schema_1.TransactionCategory.INCOME,
                    metadata: {
                        avanceId: avance._id,
                        avanceType: avance.type,
                        motif: avance.motif,
                    },
                });
            }
        }
        if (statut === avance_schema_1.AvanceStatut.REFUSE && rejectionReason) {
            avance.rejectionReason = rejectionReason;
        }
        await avance.save();
        const employee = await this.employeeModel.findById(avance.employee).exec();
        if (employee) {
            const message = statut === avance_schema_1.AvanceStatut.APPROUVE
                ? `✅ Votre demande d'avance de ${avance.montant} TND a été approuvée. Le montant a été crédité sur votre compte.`
                : `❌ Votre demande d'avance de ${avance.montant} TND a été refusée. ${rejectionReason || ''}`;
            await this.notificationsService.sendToEmployee(avance.employee.toString(), statut === avance_schema_1.AvanceStatut.APPROUVE ? '✅ Avance approuvée' : '❌ Avance refusée', message, statut === avance_schema_1.AvanceStatut.APPROUVE ? notification_schema_1.NotificationType.SUCCESS : notification_schema_1.NotificationType.WARNING);
        }
        return avance;
    }
    async markAsDebited(avanceId, transactionId) {
        const avance = await this.avanceModel.findById(avanceId).exec();
        if (!avance) {
            throw new common_1.NotFoundException('Avance introuvable');
        }
        if (avance.statut !== avance_schema_1.AvanceStatut.APPROUVE) {
            throw new common_1.BadRequestException('Cette avance n\'est pas approuvée');
        }
        avance.statut = avance_schema_1.AvanceStatut.DEBITEE;
        avance.debitedAt = new Date();
        if (transactionId) {
            avance.transactionId = new mongoose_2.Types.ObjectId(transactionId);
        }
        await avance.save();
        await this.employeeModel.findByIdAndUpdate(avance.employee, {
            $inc: { avancesEnCours: -avance.montant }
        }).exec();
        return avance;
    }
    async delete(avanceId, employeeId) {
        const avance = await this.avanceModel.findOne({
            _id: new mongoose_2.Types.ObjectId(avanceId),
            employee: new mongoose_2.Types.ObjectId(employeeId),
        }).exec();
        if (!avance) {
            throw new common_1.NotFoundException('Avance introuvable');
        }
        if (avance.statut !== avance_schema_1.AvanceStatut.EN_ATTENTE) {
            throw new common_1.BadRequestException('Seules les demandes en attente peuvent être annulées');
        }
        await this.avanceModel.findByIdAndDelete(avanceId).exec();
        await this.notificationsService.sendToEmployee(employeeId, 'Demande annulée', `Votre demande d'avance de ${avance.montant} TND a été annulée.`, notification_schema_1.NotificationType.TRANSACTION);
        return { success: true, message: 'Demande annulée' };
    }
};
exports.AvancesService = AvancesService;
exports.AvancesService = AvancesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(avance_schema_1.Avance.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(2, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(3, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], AvancesService);
//# sourceMappingURL=avances.service.js.map
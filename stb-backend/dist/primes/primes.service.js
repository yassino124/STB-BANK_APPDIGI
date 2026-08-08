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
exports.PrimesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const prime_schema_1 = require("./schemas/prime.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let PrimesService = class PrimesService {
    primeModel;
    accountModel;
    employeeModel;
    transactionModel;
    notificationsService;
    constructor(primeModel, accountModel, employeeModel, transactionModel, notificationsService) {
        this.primeModel = primeModel;
        this.accountModel = accountModel;
        this.employeeModel = employeeModel;
        this.transactionModel = transactionModel;
        this.notificationsService = notificationsService;
    }
    async create(employeeId, dto) {
        const existing = await this.primeModel.findOne({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            status: prime_schema_1.PrimeStatus.PENDING,
        }).exec();
        if (existing) {
            throw new common_1.BadRequestException('Vous avez déjà une demande de prime en cours pour ce type.');
        }
        return this.primeModel.create({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            montant: dto.montant,
            description: dto.description,
            status: prime_schema_1.PrimeStatus.PENDING,
        });
    }
    async adminCreate(approverId, dto) {
        const emp = await this.employeeModel.findById(dto.employeeId).lean().exec();
        if (!emp)
            throw new common_1.NotFoundException('Employé introuvable');
        const account = await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(dto.employeeId) }).exec();
        const prime = await this.primeModel.create({
            employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
            type: dto.type,
            montant: dto.montant,
            description: dto.description || `Prime ${dto.type} attribuée par la Finance`,
            status: prime_schema_1.PrimeStatus.PAID,
            approvedBy: new mongoose_2.Types.ObjectId(approverId),
            approvedAt: new Date(),
        });
        if (account) {
            await this.accountModel.findByIdAndUpdate(account._id, { $inc: { solde: dto.montant } });
            await this.transactionModel.create({
                employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
                accountId: account._id,
                montant: dto.montant,
                type: 'PRIME',
                category: 'OTHER',
                description: dto.description || `Prime ${dto.type}`,
                status: 'COMPLETED',
                reference: `PRM-${Date.now()}`,
                date: new Date(),
            });
            await this.employeeModel.updateOne({ _id: new mongoose_2.Types.ObjectId(dto.employeeId) }, { $inc: { compteSolde: dto.montant, totalPrimes: dto.montant } });
        }
        await this.notificationsService.sendToEmployee(dto.employeeId, '🎉 Prime créditée sur votre compte', `Votre prime de ${dto.montant} TND (${dto.type}) a été créditée directement sur votre compte STB.`, notification_schema_1.NotificationType.HR_REQUEST);
        return {
            success: true,
            prime,
            credited: !!account,
            message: account
                ? `Prime de ${dto.montant} TND créditée sur le compte de ${emp.prenom} ${emp.nom}`
                : `Prime enregistrée mais aucun compte trouvé pour ${emp.prenom} ${emp.nom}`,
        };
    }
    async distributeToAll(approverId, dto) {
        const employees = await this.employeeModel.find({ status: 'ACTIVE' }).lean().exec();
        const results = [];
        let credited = 0;
        let errors = 0;
        for (const emp of employees) {
            try {
                const account = await this.accountModel.findOne({ employeeId: emp._id }).exec();
                const prime = await this.primeModel.create({
                    employeeId: emp._id,
                    type: dto.type,
                    montant: dto.montant,
                    description: dto.description || `Prime ${dto.type} — distribution Finance`,
                    status: prime_schema_1.PrimeStatus.PAID,
                    approvedBy: new mongoose_2.Types.ObjectId(approverId),
                    approvedAt: new Date(),
                });
                if (account) {
                    await this.accountModel.findByIdAndUpdate(account._id, { $inc: { solde: dto.montant } });
                    await this.transactionModel.create({
                        employeeId: emp._id,
                        accountId: account._id,
                        montant: dto.montant,
                        type: 'PRIME',
                        category: 'OTHER',
                        description: dto.description || `Prime ${dto.type}`,
                        status: 'COMPLETED',
                        reference: `PRM-${Date.now()}-${emp.matricule}`,
                        date: new Date(),
                    });
                    await this.employeeModel.updateOne({ _id: emp._id }, { $inc: { compteSolde: dto.montant, totalPrimes: dto.montant } });
                    credited++;
                }
                await this.notificationsService.sendToEmployee(emp._id.toString(), '🎉 Prime créditée sur votre compte', `Votre prime de ${dto.montant} TND (${dto.type}) a été créditée sur votre compte STB.`, notification_schema_1.NotificationType.HR_REQUEST);
                results.push({ matricule: emp.matricule, nom: `${emp.prenom} ${emp.nom}`, credited: !!account, primeId: prime._id });
            }
            catch (err) {
                errors++;
                results.push({ matricule: emp.matricule, error: err.message });
            }
        }
        return {
            success: true,
            total: employees.length,
            credited,
            errors,
            montantTotal: credited * dto.montant,
            results,
        };
    }
    async getMyPrimes(employeeId) {
        return this.primeModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async getAllPrimes(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.primeModel.find(filter).populate('employeeId', 'nom prenom matricule avatar').sort({ createdAt: -1 }).exec();
    }
    async handle(id, approverId, decision) {
        const prime = await this.primeModel.findById(id).exec();
        if (!prime)
            throw new Error('Prime introuvable');
        prime.status = decision === 'APPROVED' ? prime_schema_1.PrimeStatus.APPROVED : prime_schema_1.PrimeStatus.REJECTED;
        prime.approvedBy = new mongoose_2.Types.ObjectId(approverId);
        prime.approvedAt = new Date();
        await prime.save();
        await this.notificationsService.sendToEmployee(prime.employeeId.toString(), decision === 'APPROVED' ? '🎉 Prime approuvée' : '❌ Prime refusée', decision === 'APPROVED'
            ? `Votre prime de ${prime.montant} TND a été approuvée!`
            : 'Votre demande de prime a été refusée.', notification_schema_1.NotificationType.HR_REQUEST);
        return prime;
    }
};
exports.PrimesService = PrimesService;
exports.PrimesService = PrimesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(prime_schema_1.Prime.name)),
    __param(1, (0, mongoose_1.InjectModel)('Account')),
    __param(2, (0, mongoose_1.InjectModel)('Employee')),
    __param(3, (0, mongoose_1.InjectModel)('Transaction')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], PrimesService);
//# sourceMappingURL=primes.service.js.map
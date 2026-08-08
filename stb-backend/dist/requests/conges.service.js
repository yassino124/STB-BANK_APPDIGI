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
exports.CongesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conge_schema_1 = require("./schemas/conge.schema");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
let CongesService = class CongesService {
    congeModel;
    employeeModel;
    accountModel;
    transactionModel;
    constructor(congeModel, employeeModel, accountModel, transactionModel) {
        this.congeModel = congeModel;
        this.employeeModel = employeeModel;
        this.accountModel = accountModel;
        this.transactionModel = transactionModel;
    }
    async createCongeRequest(employeeId, type, startDate, endDate, motif) {
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('Employé non trouvé');
        }
        const dureeDays = this.calculateDuration(startDate, endDate);
        await this.validateCongeRequest(employee, type, dureeDays);
        const conge = new this.congeModel({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type,
            status: conge_schema_1.CongeStatus.EN_ATTENTE,
            startDate,
            endDate,
            dureeDays,
            motif: motif || `Congé ${type}`,
            approvals: {},
        });
        await conge.save();
        return conge;
    }
    async validateCongeRequest(employee, type, dureeDays) {
        const rules = conge_schema_1.CONGE_RULES[type];
        if (rules.dureeMax && dureeDays > rules.dureeMax) {
            throw new common_1.BadRequestException(`Durée maximale pour ${type}: ${rules.dureeMax} jours`);
        }
        if (rules.deductFromSolde && employee.soldeConges < dureeDays) {
            throw new common_1.BadRequestException(`Solde insuffisant. Disponible: ${employee.soldeConges} jours, Demandé: ${dureeDays} jours`);
        }
        if (rules.limiteCarriere) {
            const count = await this.congeModel.countDocuments({
                employeeId: new mongoose_2.Types.ObjectId(employee._id),
                type,
                countedInCarrierLimit: true,
                status: { $in: [conge_schema_1.CongeStatus.APPROUVE] },
            });
            if (count >= rules.limiteCarriere) {
                throw new common_1.BadRequestException(`Limite carrière atteinte pour ${type}: ${rules.limiteCarriere} fois maximum`);
            }
        }
    }
    calculateDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let days = 0;
        const current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days++;
            }
            current.setDate(current.getDate() + 1);
        }
        return days;
    }
    async approveConge(congeId, approverId, role) {
        const conge = await this.congeModel.findById(congeId).populate('employeeId');
        if (!conge) {
            throw new common_1.NotFoundException('Congé non trouvé');
        }
        if (conge.status !== conge_schema_1.CongeStatus.EN_ATTENTE) {
            throw new common_1.BadRequestException('Ce congé a déjà été traité');
        }
        const employee = conge.employeeId;
        const rules = conge_schema_1.CONGE_RULES[conge.type];
        conge.status = conge_schema_1.CongeStatus.APPROUVE;
        conge.approvals = {
            rh: {
                approved: true,
                date: new Date(),
                rhId: new mongoose_2.Types.ObjectId(approverId),
            }
        };
        await this.deductSolde(employee, conge);
        await conge.save();
        const account = await this.accountModel.findOne({
            employeeId: employee._id,
            isPrimary: true,
        }).exec();
        if (account) {
            const reference = `CNG-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
            await this.transactionModel.create({
                employeeId: employee._id,
                accountId: account._id,
                montant: 0,
                type: transaction_schema_1.TransactionType.CONGE,
                description: `Congé ${conge.type} approuvé (${conge.dureeDays} jours)`,
                status: transaction_schema_1.TransactionStatus.COMPLETED,
                date: new Date(),
                reference,
                category: transaction_schema_1.TransactionCategory.OTHER,
                metadata: {
                    congeId: conge._id,
                    congeType: conge.type,
                    startDate: conge.startDate,
                    endDate: conge.endDate,
                    dureeDays: conge.dureeDays,
                    motif: conge.motif,
                },
            });
        }
        return conge;
    }
    async deductSolde(employee, conge) {
        const rules = conge_schema_1.CONGE_RULES[conge.type];
        if (rules.deductFromSolde) {
            const newSolde = Math.max(0, employee.soldeConges - conge.dureeDays);
            await this.employeeModel.findByIdAndUpdate(employee._id, {
                soldeConges: newSolde,
            });
        }
        if (rules.limiteCarriere) {
            conge.countedInCarrierLimit = true;
        }
    }
    async refuseConge(congeId, reason) {
        const conge = await this.congeModel.findById(congeId);
        if (!conge) {
            throw new common_1.NotFoundException('Congé non trouvé');
        }
        if (conge.status !== conge_schema_1.CongeStatus.EN_ATTENTE) {
            throw new common_1.BadRequestException('Ce congé a déjà été traité');
        }
        conge.status = conge_schema_1.CongeStatus.REFUSE;
        conge.refusalReason = reason;
        await conge.save();
        return conge;
    }
    async uploadJustificatif(congeId, file) {
        const conge = await this.congeModel.findById(congeId);
        if (!conge) {
            throw new common_1.NotFoundException('Congé non trouvé');
        }
        conge.justificatif = {
            filename: file.filename,
            url: file.url,
            mimetype: file.mimetype,
            uploadedAt: new Date(),
        };
        if (conge.type === conge_schema_1.CongeType.MALADIE &&
            file.mimetype === 'application/pdf' &&
            conge.status === conge_schema_1.CongeStatus.EN_ATTENTE) {
            conge.status = conge_schema_1.CongeStatus.APPROUVE;
            const employee = await this.employeeModel.findById(conge.employeeId);
            if (employee) {
                await this.deductSolde(employee, conge);
            }
        }
        await conge.save();
        return conge;
    }
    async getMyConges(employeeId) {
        return this.congeModel
            .find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAllConges(filters) {
        const query = {};
        if (filters?.statut) {
            query.status = filters.statut;
        }
        if (filters?.employeeId) {
            query.employeeId = new mongoose_2.Types.ObjectId(filters.employeeId);
        }
        return this.congeModel
            .find(query)
            .populate('employeeId', 'matricule nom prenom email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getPendingTeam(managerId) {
        const teamMembers = await this.employeeModel
            .find({ managerId: new mongoose_2.Types.ObjectId(managerId) })
            .select('_id');
        const teamIds = teamMembers.map((e) => e._id);
        return this.congeModel
            .find({
            employeeId: { $in: teamIds },
            status: conge_schema_1.CongeStatus.EN_ATTENTE,
        })
            .populate('employeeId', 'matricule nom prenom email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getTeamCalendar(managerId, month, year) {
        const teamMembers = await this.employeeModel
            .find({ managerId: new mongoose_2.Types.ObjectId(managerId) })
            .select('_id');
        const teamIds = teamMembers.map((e) => e._id);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        return this.congeModel
            .find({
            employeeId: { $in: teamIds },
            status: conge_schema_1.CongeStatus.APPROUVE,
            $or: [
                { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } },
            ],
        })
            .populate('employeeId', 'prenom nom avatar')
            .sort({ startDate: 1 })
            .exec();
    }
    async handleYearEndConges() {
        const employees = await this.employeeModel.find({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).exec();
        for (const emp of employees) {
            const soldeRestant = emp.soldeConges;
            const reportMax = 15;
            const soldeReporte = Math.min(soldeRestant, reportMax);
            const soldePerte = soldeRestant - soldeReporte;
            const newSolde = 90 + soldeReporte;
            const newMetadata = {
                ...(emp.metadata || {}),
                lastYearReport: {
                    year: new Date().getFullYear() - 1,
                    soldeReporte,
                    soldePerte,
                    date: new Date(),
                },
            };
            await this.employeeModel.findByIdAndUpdate(emp._id, {
                soldeConges: newSolde,
                metadata: newMetadata,
            });
        }
    }
};
exports.CongesService = CongesService;
exports.CongesService = CongesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conge_schema_1.Conge.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(2, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(3, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CongesService);
//# sourceMappingURL=conges.service.js.map
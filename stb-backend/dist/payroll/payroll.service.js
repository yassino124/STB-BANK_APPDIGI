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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payroll_schema_1 = require("./schemas/payroll.schema");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const credits_service_1 = require("../credits/credits.service");
const string_util_1 = require("../common/utils/string.util");
let PayrollService = class PayrollService {
    payrollModel;
    employeeModel;
    accountModel;
    transactionModel;
    notificationsService;
    creditsService;
    constructor(payrollModel, employeeModel, accountModel, transactionModel, notificationsService, creditsService) {
        this.payrollModel = payrollModel;
        this.employeeModel = employeeModel;
        this.accountModel = accountModel;
        this.transactionModel = transactionModel;
        this.notificationsService = notificationsService;
        this.creditsService = creditsService;
    }
    async generateMonthlyPayroll(mois, annee) {
        const employees = await this.employeeModel.find({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).exec();
        const results = [];
        for (const emp of employees) {
            try {
                const existing = await this.payrollModel.findOne({ employeeId: emp._id, mois, annee }).exec();
                if (existing) {
                    results.push({ matricule: emp.matricule, status: 'ALREADY_EXISTS' });
                    continue;
                }
                const salaireBrut = emp.salaireBase;
                if (!salaireBrut || salaireBrut <= 0) {
                    results.push({ matricule: emp.matricule, status: 'SKIPPED', error: 'salaireBase non défini — configurez le salaire de cet employé avant de générer la paie' });
                    continue;
                }
                const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
                const impot = Math.round(salaireBrut * 0.15 * 100) / 100;
                let retenues = 0;
                const credits = await this.creditsService.getMyCredits(emp._id.toString());
                for (const credit of credits) {
                    if (credit.status === 'ACTIVE') {
                        retenues += Math.min(credit.mensualite, credit.montantRestant);
                    }
                }
                const avanceADeduire = emp.avancesEnCours || 0;
                retenues += avanceADeduire;
                retenues = Math.min(retenues, salaireBrut * 0.7);
                retenues = Math.round(retenues * 100) / 100;
                const totalRestant = credits.reduce((acc, c) => acc + (c.status === 'ACTIVE' ? c.montantRestant : 0), 0);
                emp.creditsEnCours = Math.max(0, totalRestant - (retenues - avanceADeduire));
                emp.avancesEnCours = 0;
                await emp.save();
                const salaireNet = Math.round((salaireBrut - cnss - impot - retenues) * 100) / 100;
                const payroll = await this.payrollModel.create({
                    employeeId: emp._id,
                    mois,
                    annee,
                    salaireBrut,
                    cnss,
                    impot,
                    retenues,
                    salaireNet,
                    status: payroll_schema_1.PayrollStatus.VALIDATED,
                });
                await this.notificationsService.sendToEmployee(emp._id.toString(), '💰 Fiche de paie disponible', `Votre fiche de paie de ${this.getMonthName(mois)} ${annee} est prête. Salaire net: ${salaireNet} TND.`, notification_schema_1.NotificationType.SYSTEM);
                results.push({ matricule: emp.matricule, status: 'CREATED', salaireNet });
            }
            catch (e) {
                results.push({ matricule: emp.matricule, status: 'ERROR', error: e.message });
            }
        }
        return results;
    }
    async getMyPayrolls(employeeId) {
        return this.payrollModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ annee: -1, mois: -1 }).exec();
    }
    async getPayrollById(id) {
        const p = await this.payrollModel.findById(id).populate('employeeId').exec();
        if (!p)
            throw new common_1.NotFoundException('Fiche de paie introuvable');
        return p;
    }
    async getAllPayrolls(mois, annee) {
        const filter = {};
        if (mois)
            filter.mois = mois;
        if (annee)
            filter.annee = annee;
        return this.payrollModel.find(filter).populate('employeeId', 'nom prenom matricule departement avatar roles').sort({ annee: -1, mois: -1 }).exec();
    }
    async creditMonthlySalaries(employeeId, force) {
        const mois = new Date().getMonth() + 1;
        const annee = new Date().getFullYear();
        const query = { status: employee_status_enum_1.EmployeeStatus.ACTIVE };
        if (employeeId) {
            query._id = new mongoose_2.Types.ObjectId(employeeId);
        }
        const employees = await this.employeeModel.find(query).exec();
        const results = [];
        for (const emp of employees) {
            try {
                if (!force) {
                    const existingPayroll = await this.payrollModel.findOne({ employeeId: emp._id, mois, annee }).exec();
                    if (existingPayroll) {
                        results.push({
                            matricule: emp.matricule,
                            error: `Paie déjà versée pour ${this.getMonthName(mois)} ${annee} — utilisez force:true pour re-verser`
                        });
                        continue;
                    }
                }
                const freshEmp = await this.employeeModel.findById(emp._id).lean().exec();
                const salaireBrut = freshEmp?.salaireBase;
                if (!salaireBrut || salaireBrut <= 0) {
                    results.push({
                        matricule: emp.matricule,
                        error: 'salaireBase non défini — configurez le salaire de cet employé avant de virer la paie'
                    });
                    continue;
                }
                const account = await this.accountModel.findOne({ employeeId: emp._id }).exec();
                if (!account) {
                    results.push({
                        matricule: emp.matricule,
                        error: 'Compte bancaire introuvable'
                    });
                    continue;
                }
                const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
                const impot = Math.round(salaireBrut * 0.15 * 100) / 100;
                const deductionsSociales = cnss + impot;
                const credits = await this.creditsService.getMyCredits(emp._id.toString());
                const activeCredits = credits.filter(c => c.status === 'ACTIVE');
                let totalMensualitesCredits = 0;
                const creditDetails = [];
                for (const credit of activeCredits) {
                    const tauxMensuel = credit.tauxInteret / 100 / 12;
                    const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
                    const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
                    const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
                    totalMensualitesCredits += mensualiteActuelle;
                    creditDetails.push({
                        creditId: credit._id,
                        title: credit.title,
                        mensualite: mensualiteActuelle,
                        capital: capitalRembourse,
                        interets: interetsMois,
                    });
                }
                const avancesADeduire = emp.avancesEnCours || 0;
                const totalDeductionsFinancieres = Math.round((totalMensualitesCredits + avancesADeduire) * 100) / 100;
                const salaireAvantCredits = salaireBrut - deductionsSociales;
                const salaireNet = Math.max(0, Math.round((salaireAvantCredits - totalDeductionsFinancieres) * 100) / 100);
                await this.accountModel.findByIdAndUpdate(account._id, {
                    $inc: { solde: salaireNet }
                }).exec();
                const refSalaire = string_util_1.StringUtil.generateReference('SAL');
                await this.transactionModel.create({
                    employeeId: emp._id,
                    accountId: account._id,
                    montant: salaireNet,
                    type: transaction_schema_1.TransactionType.SALARY,
                    category: transaction_schema_1.TransactionCategory.SALARY,
                    description: `Salaire ${this.getMonthName(new Date().getMonth() + 1)} ${new Date().getFullYear()}`,
                    status: transaction_schema_1.TransactionStatus.COMPLETED,
                    reference: refSalaire,
                    date: new Date(),
                    metadata: {
                        salaireBrut,
                        cnss,
                        impot,
                        deductionsSociales,
                        totalCredits: totalMensualitesCredits,
                        avancesDeduites: avancesADeduire,
                        salaireNet,
                    }
                });
                if (avancesADeduire > 0) {
                    const refAvance = string_util_1.StringUtil.generateReference('AVN');
                    await this.transactionModel.create({
                        employeeId: emp._id,
                        accountId: account._id,
                        montant: -avancesADeduire,
                        type: transaction_schema_1.TransactionType.AVANCE,
                        category: transaction_schema_1.TransactionCategory.OTHER,
                        description: `Déduction avances sur salaire`,
                        status: transaction_schema_1.TransactionStatus.COMPLETED,
                        reference: refAvance,
                        date: new Date(),
                        metadata: {
                            montantDeduit: avancesADeduire,
                            deductionSource: 'PAYROLL',
                        }
                    });
                }
                const creditPayments = [];
                for (const detail of creditDetails) {
                    try {
                        const credit = activeCredits.find(c => c._id.toString() === detail.creditId.toString());
                        if (!credit)
                            continue;
                        const refCredit = string_util_1.StringUtil.generateReference('CRD');
                        const transaction = await this.transactionModel.create({
                            employeeId: emp._id,
                            accountId: account._id,
                            montant: detail.mensualite,
                            type: transaction_schema_1.TransactionType.CREDIT_PAYMENT,
                            category: transaction_schema_1.TransactionCategory.CREDIT,
                            description: `Prélèvement crédit ${detail.title}`,
                            status: transaction_schema_1.TransactionStatus.COMPLETED,
                            reference: refCredit,
                            date: new Date(),
                            metadata: {
                                creditId: detail.creditId.toString(),
                                capital: detail.capital,
                                interets: detail.interets,
                                deductionSource: 'PAYROLL',
                            }
                        });
                        const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - detail.capital) * 100) / 100);
                        credit.montantRestant = nouveauRestant;
                        if (credit.montantRestant <= 0) {
                            credit.montantRestant = 0;
                            credit.status = 'CLOSED';
                        }
                        await credit.save();
                        await this.creditsService['paymentModel'].create({
                            creditId: credit._id,
                            employeeId: emp._id,
                            montant: detail.mensualite,
                            capital: detail.capital,
                            interets: detail.interets,
                            montantRestantApres: nouveauRestant,
                            datePaiement: new Date(),
                            mode: 'PAYROLL',
                            transactionId: transaction._id,
                            isLate: false,
                            penalite: 0,
                        });
                        creditPayments.push({
                            creditTitle: detail.title,
                            mensualite: detail.mensualite,
                            capital: detail.capital,
                            interets: detail.interets,
                            reste: nouveauRestant,
                            transactionRef: refCredit,
                        });
                    }
                    catch (creditError) {
                        console.error(`Erreur traitement crédit ${detail.creditId}:`, creditError);
                    }
                }
                await this.employeeModel.updateOne({ _id: emp._id }, {
                    $inc: { compteSolde: salaireNet },
                    $set: { avancesEnCours: 0 }
                });
                let notifMessage = `Salaire brut: ${salaireBrut} TND\n`;
                notifMessage += `Déductions sociales: -${deductionsSociales.toFixed(2)} TND\n`;
                if (avancesADeduire > 0) {
                    notifMessage += `\n💰 Avances déduites: -${avancesADeduire.toFixed(2)} TND\n`;
                }
                if (creditPayments.length > 0) {
                    notifMessage += `\n💳 Crédits déduits:\n`;
                    creditPayments.forEach(cp => {
                        notifMessage += `- ${cp.creditTitle}: ${cp.mensualite.toFixed(2)} TND (Capital: ${cp.capital.toFixed(2)} + Intérêts: ${cp.interets.toFixed(2)})\n`;
                    });
                }
                notifMessage += `\n✅ Versement net: ${salaireNet.toFixed(2)} TND`;
                await this.notificationsService.sendToEmployee(emp._id.toString(), '💰 Salaire versé', notifMessage, notification_schema_1.NotificationType.SYSTEM);
                if (force) {
                    await this.payrollModel.findOneAndDelete({ employeeId: emp._id, mois, annee }).exec();
                }
                await this.payrollModel.create({
                    employeeId: emp._id,
                    mois,
                    annee,
                    salaireBrut,
                    cnss,
                    impot,
                    retenues: totalMensualitesCredits + avancesADeduire,
                    salaireNet,
                    status: payroll_schema_1.PayrollStatus.PAID,
                });
                results.push({
                    matricule: emp.matricule,
                    salaireBrut,
                    deductionsSociales,
                    avancesDeduites: avancesADeduire,
                    creditsDebites: totalMensualitesCredits,
                    salaireNet,
                    creditPayments,
                    newBalance: account.solde + salaireNet,
                });
            }
            catch (e) {
                results.push({
                    matricule: emp.matricule,
                    error: e.message
                });
            }
        }
        return results;
    }
    getMonthName(mois) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return months[mois - 1] || String(mois);
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payroll_schema_1.Payroll.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(2, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(3, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        credits_service_1.CreditsService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map
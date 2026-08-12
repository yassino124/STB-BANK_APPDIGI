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
exports.CreditsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const credit_schema_1 = require("./schemas/credit.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const employee_schema_1 = require("../employees/employee.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const rules_service_1 = require("../rules/rules.service");
const string_util_1 = require("../common/utils/string.util");
let CreditsService = class CreditsService {
    creditModel;
    paymentModel;
    accountModel;
    employeeModel;
    transactionModel;
    notificationsService;
    rulesService;
    constructor(creditModel, paymentModel, accountModel, employeeModel, transactionModel, notificationsService, rulesService) {
        this.creditModel = creditModel;
        this.paymentModel = paymentModel;
        this.accountModel = accountModel;
        this.employeeModel = employeeModel;
        this.transactionModel = transactionModel;
        this.notificationsService = notificationsService;
        this.rulesService = rulesService;
    }
    async create(employeeId, data) {
        const employee = await this.employeeModel.findById(employeeId).exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable');
        const formula = this.rulesService.getRule('credit.formula', 'salary * 6');
        const maxCredit = this.rulesService.evaluateFormula(formula, { salary: employee.salaireBase || 1000 });
        if (data.montantInitial > maxCredit) {
            throw new common_1.BadRequestException(`Montant du crédit trop élevé. Le maximum autorisé selon votre profil est de ${maxCredit.toFixed(2)} TND.`);
        }
        const { montantInitial, tauxInteret, nombreMois, dateDebut } = data;
        const r = tauxInteret / 100 / 12;
        const mensualite = r === 0 ? montantInitial / nombreMois : Math.round(montantInitial * r * Math.pow(1 + r, nombreMois) / (Math.pow(1 + r, nombreMois) - 1) * 100) / 100;
        const dateDebutDate = new Date(dateDebut);
        const dateFin = new Date(dateDebutDate);
        dateFin.setMonth(dateFin.getMonth() + nombreMois);
        const credit = await this.creditModel.create({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            title: data.title,
            type: data.type,
            montantInitial,
            montantRestant: montantInitial,
            tauxInteret,
            mensualite,
            nombreMois,
            dateDebut: dateDebutDate,
            dateFin,
            status: credit_schema_1.CreditStatus.ACTIVE,
        });
        await this.employeeModel.findByIdAndUpdate(employeeId, {
            $inc: { creditsEnCours: montantInitial }
        });
        return credit;
    }
    async getMyCredits(employeeId) {
        return this.creditModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async getAllCredits() {
        return this.creditModel.find().populate('employeeId', 'nom prenom matricule avatar').sort({ createdAt: -1 }).exec();
    }
    async processLatePaymentPenalties() {
        const lateCredits = await this.creditModel.find({ status: credit_schema_1.CreditStatus.LATE }).exec();
        const results = [];
        for (const credit of lateCredits) {
            try {
                const penalite = Math.round(credit.mensualite * 0.05 * 100) / 100;
                credit.montantRestant = Math.round((credit.montantRestant + penalite) * 100) / 100;
                await credit.save();
                await this.paymentModel.create({
                    creditId: credit._id,
                    employeeId: credit.employeeId,
                    montant: penalite,
                    capital: 0,
                    interets: 0,
                    montantRestantApres: credit.montantRestant,
                    datePaiement: new Date(),
                    mode: 'PENALTY',
                    isLate: true,
                    penalite: penalite,
                });
                await this.notificationsService.sendToEmployee(credit.employeeId.toString(), '⚠️ Pénalité de retard appliquée', `Une pénalité de ${penalite.toFixed(2)} TND a été appliquée à votre crédit ${credit.title} pour paiement en retard. Nouveau solde: ${credit.montantRestant.toFixed(2)} TND`, notification_schema_1.NotificationType.WARNING);
                results.push({
                    creditId: credit._id,
                    penalite,
                    nouveauSolde: credit.montantRestant,
                });
            }
            catch (e) {
                results.push({
                    creditId: credit._id,
                    error: e.message,
                });
            }
        }
        return results;
    }
    async retryLatePayment(creditId) {
        const credit = await this.creditModel.findById(creditId).exec();
        if (!credit)
            throw new common_1.NotFoundException('Crédit introuvable');
        if (credit.status !== credit_schema_1.CreditStatus.LATE) {
            throw new common_1.BadRequestException('Ce crédit n\'est pas en retard');
        }
        const account = await this.accountModel.findOne({ employeeId: credit.employeeId }).exec();
        if (!account)
            throw new common_1.NotFoundException('Compte bancaire introuvable');
        const tauxMensuel = credit.tauxInteret / 100 / 12;
        const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
        const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
        const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
        if (account.solde < mensualiteActuelle) {
            throw new common_1.BadRequestException(`Solde toujours insuffisant. Requis: ${mensualiteActuelle.toFixed(2)} TND, Disponible: ${account.solde.toFixed(2)} TND`);
        }
        await this.accountModel.findByIdAndUpdate(account._id, {
            $inc: { solde: -mensualiteActuelle }
        }).exec();
        const reference = string_util_1.StringUtil.generateReference('CRD');
        const transaction = await this.transactionModel.create({
            employeeId: credit.employeeId,
            accountId: account._id,
            montant: mensualiteActuelle,
            type: transaction_schema_1.TransactionType.CREDIT_PAYMENT,
            category: transaction_schema_1.TransactionCategory.CREDIT,
            description: `Régularisation crédit ${credit.title} (retard)`,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            reference,
            date: new Date(),
            metadata: {
                creditId: credit._id.toString(),
                capital: capitalRembourse,
                interets: interetsMois,
                wasLate: true,
            }
        });
        const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - capitalRembourse) * 100) / 100);
        credit.montantRestant = nouveauRestant;
        credit.status = nouveauRestant <= 0 ? credit_schema_1.CreditStatus.CLOSED : credit_schema_1.CreditStatus.ACTIVE;
        await credit.save();
        await this.paymentModel.create({
            creditId: credit._id,
            employeeId: credit.employeeId,
            montant: mensualiteActuelle,
            capital: capitalRembourse,
            interets: interetsMois,
            montantRestantApres: nouveauRestant,
            datePaiement: new Date(),
            mode: 'LATE_RETRY',
            transactionId: transaction._id,
            isLate: false,
            penalite: 0,
        });
        await this.notificationsService.sendToEmployee(credit.employeeId.toString(), '✅ Paiement régularisé', `Votre paiement en retard a été régularisé. Mensualité: ${mensualiteActuelle.toFixed(2)} TND. Reste: ${nouveauRestant.toFixed(2)} TND`, notification_schema_1.NotificationType.SUCCESS);
        return {
            success: true,
            mensualite: mensualiteActuelle,
            capital: capitalRembourse,
            interets: interetsMois,
            reste: nouveauRestant,
            status: credit.status,
        };
    }
    async calculateEarlyRepayment(creditId) {
        const credit = await this.creditModel.findById(creditId).exec();
        if (!credit)
            throw new common_1.NotFoundException('Crédit introuvable');
        if (credit.status === credit_schema_1.CreditStatus.CLOSED) {
            throw new common_1.BadRequestException('Ce crédit est déjà soldé');
        }
        const now = new Date();
        const dateFin = new Date(credit.dateFin);
        const moisRestants = Math.max(0, Math.round((dateFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const tauxMensuel = credit.tauxInteret / 100 / 12;
        let interetsRestantsTheoriques = 0;
        let montantTemp = credit.montantRestant;
        for (let i = 0; i < moisRestants && montantTemp > 0; i++) {
            const interetsMois = Math.round(montantTemp * tauxMensuel * 100) / 100;
            interetsRestantsTheoriques += interetsMois;
            const capitalMois = Math.min(credit.mensualite - interetsMois, montantTemp);
            montantTemp -= capitalMois;
        }
        const economieInterets = Math.round(interetsRestantsTheoriques * 100) / 100;
        const fraisRemboursement = Math.round(credit.montantRestant * 0.01 * 100) / 100;
        const montantTotal = Math.round((credit.montantRestant + fraisRemboursement) * 100) / 100;
        return {
            creditId: credit._id,
            title: credit.title,
            capitalRestant: credit.montantRestant,
            moisRestants,
            economieInterets,
            fraisRemboursement,
            montantTotal,
            economieNette: Math.round((economieInterets - fraisRemboursement) * 100) / 100,
        };
    }
    async performEarlyRepayment(creditId) {
        const credit = await this.creditModel.findById(creditId).exec();
        if (!credit)
            throw new common_1.NotFoundException('Crédit introuvable');
        if (credit.status === credit_schema_1.CreditStatus.CLOSED) {
            throw new common_1.BadRequestException('Ce crédit est déjà soldé');
        }
        const account = await this.accountModel.findOne({ employeeId: credit.employeeId }).exec();
        if (!account)
            throw new common_1.NotFoundException('Compte bancaire introuvable');
        const calculation = await this.calculateEarlyRepayment(creditId);
        const montantTotal = calculation.montantTotal;
        if (account.solde < montantTotal) {
            throw new common_1.BadRequestException(`Solde insuffisant pour remboursement anticipé. Requis: ${montantTotal.toFixed(2)} TND, Disponible: ${account.solde.toFixed(2)} TND`);
        }
        await this.accountModel.findByIdAndUpdate(account._id, {
            $inc: { solde: -montantTotal }
        }).exec();
        const reference = string_util_1.StringUtil.generateReference('CRD');
        const transaction = await this.transactionModel.create({
            employeeId: credit.employeeId,
            accountId: account._id,
            montant: montantTotal,
            type: transaction_schema_1.TransactionType.CREDIT_PAYMENT,
            category: transaction_schema_1.TransactionCategory.CREDIT,
            description: `Remboursement anticipé crédit ${credit.title}`,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            reference,
            date: new Date(),
            metadata: {
                creditId: credit._id.toString(),
                capital: credit.montantRestant,
                interets: 0,
                fraisRemboursement: calculation.fraisRemboursement,
                economieInterets: calculation.economieInterets,
                isEarlyRepayment: true,
            }
        });
        const capitalRembourse = credit.montantRestant;
        credit.montantRestant = 0;
        credit.status = credit_schema_1.CreditStatus.CLOSED;
        await credit.save();
        await this.paymentModel.create({
            creditId: credit._id,
            employeeId: credit.employeeId,
            montant: montantTotal,
            capital: capitalRembourse,
            interets: 0,
            montantRestantApres: 0,
            datePaiement: new Date(),
            mode: 'EARLY_REPAYMENT',
            transactionId: transaction._id,
            isLate: false,
            penalite: calculation.fraisRemboursement,
        });
        await this.employeeModel.findByIdAndUpdate(credit.employeeId, {
            $inc: { creditsEnCours: -capitalRembourse }
        });
        let notifMessage = `🎉 Félicitations! Votre crédit ${credit.title} est entièrement remboursé.\n\n`;
        notifMessage += `💰 Montant débit: ${montantTotal.toFixed(2)} TND\n`;
        notifMessage += `   • Capital: ${capitalRembourse.toFixed(2)} TND\n`;
        notifMessage += `   • Frais: ${calculation.fraisRemboursement.toFixed(2)} TND\n\n`;
        notifMessage += `💵 Économie intérêts: ${calculation.economieInterets.toFixed(2)} TND\n`;
        notifMessage += `✅ Économie nette: ${calculation.economieNette.toFixed(2)} TND`;
        await this.notificationsService.sendToEmployee(credit.employeeId.toString(), '🎉 Crédit soldé par anticipation', notifMessage, notification_schema_1.NotificationType.SUCCESS);
        return {
            success: true,
            creditId: credit._id,
            montantDebite: montantTotal,
            capital: capitalRembourse,
            frais: calculation.fraisRemboursement,
            economieInterets: calculation.economieInterets,
            economieNette: calculation.economieNette,
            transactionRef: reference,
        };
    }
    async generateAmortizationTable(creditId) {
        const credit = await this.creditModel.findById(creditId).exec();
        if (!credit)
            throw new common_1.NotFoundException('Crédit introuvable');
        const tauxMensuel = credit.tauxInteret / 100 / 12;
        const dateDebut = new Date(credit.dateDebut);
        const payments = await this.paymentModel
            .find({ creditId: credit._id })
            .sort({ datePaiement: 1 })
            .exec();
        const paymentsByMonth = new Map();
        payments.forEach(p => {
            const moisIndex = Math.floor((new Date(p.datePaiement).getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 30));
            if (!paymentsByMonth.has(moisIndex)) {
                paymentsByMonth.set(moisIndex, p);
            }
        });
        const table = [];
        let soldeRestant = credit.montantInitial;
        let totalInteretsPayes = 0;
        let totalCapitalPaye = 0;
        for (let mois = 1; mois <= credit.nombreMois; mois++) {
            if (soldeRestant <= 0)
                break;
            const interetsMois = Math.round(soldeRestant * tauxMensuel * 100) / 100;
            const capitalMois = Math.min(Math.round((credit.mensualite - interetsMois) * 100) / 100, soldeRestant);
            const mensualiteMois = capitalMois + interetsMois;
            const paiement = paymentsByMonth.get(mois - 1);
            const isPaid = !!paiement;
            const datePaiement = paiement?.datePaiement;
            const dateEcheance = new Date(dateDebut);
            dateEcheance.setMonth(dateEcheance.getMonth() + mois);
            soldeRestant = Math.max(0, Math.round((soldeRestant - capitalMois) * 100) / 100);
            if (isPaid) {
                totalInteretsPayes += interetsMois;
                totalCapitalPaye += capitalMois;
            }
            table.push({
                mois,
                dateEcheance: dateEcheance.toISOString().split('T')[0],
                mensualite: mensualiteMois,
                capital: capitalMois,
                interets: interetsMois,
                soldeRestant,
                isPaid,
                datePaiement: datePaiement ? new Date(datePaiement).toISOString().split('T')[0] : null,
                capitalPaye: isPaid ? paiement.capital : 0,
                interetsPayes: isPaid ? paiement.interets : 0,
            });
        }
        const totalMensualites = credit.mensualite * credit.nombreMois;
        const totalInteretsTheoriques = totalMensualites - credit.montantInitial;
        const moisPayes = table.filter(t => t.isPaid).length;
        const moisRestants = credit.nombreMois - moisPayes;
        return {
            creditId: credit._id,
            title: credit.title,
            montantInitial: credit.montantInitial,
            montantRestant: credit.montantRestant,
            tauxInteret: credit.tauxInteret,
            nombreMois: credit.nombreMois,
            mensualite: credit.mensualite,
            dateDebut: credit.dateDebut,
            dateFin: credit.dateFin,
            status: credit.status,
            totalMensualites,
            totalInteretsTheoriques,
            totalCapitalPaye,
            totalInteretsPayes,
            moisPayes,
            moisRestants,
            progressionPct: Math.round((totalCapitalPaye / credit.montantInitial) * 100),
            tableau: table,
        };
    }
    async getPaymentHistory(creditId) {
        const credit = await this.creditModel.findById(creditId).exec();
        if (!credit)
            throw new common_1.NotFoundException('Crédit introuvable');
        const payments = await this.paymentModel
            .find({ creditId: credit._id })
            .sort({ datePaiement: -1 })
            .populate('transactionId')
            .exec();
        return {
            creditId: credit._id,
            title: credit.title,
            totalPayments: payments.length,
            payments: payments.map(p => ({
                id: p._id,
                datePaiement: p.datePaiement,
                montant: p.montant,
                capital: p.capital,
                interets: p.interets,
                montantRestantApres: p.montantRestantApres,
                mode: p.mode,
                isLate: p.isLate,
                penalite: p.penalite,
                transactionRef: p.transactionId?.reference,
            })),
        };
    }
    async processMonthlyCreditDeductions() {
        const credits = await this.creditModel.find({ status: credit_schema_1.CreditStatus.ACTIVE }).exec();
        const results = [];
        for (const credit of credits) {
            try {
                const account = await this.accountModel.findOne({
                    employeeId: credit.employeeId
                }).exec();
                if (!account) {
                    results.push({
                        creditId: credit._id,
                        status: 'ERREUR',
                        raison: 'Compte bancaire introuvable'
                    });
                    continue;
                }
                const tauxMensuel = credit.tauxInteret / 100 / 12;
                const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
                const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
                const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
                if (account.solde < mensualiteActuelle) {
                    credit.status = credit_schema_1.CreditStatus.LATE;
                    await credit.save();
                    await this.notificationsService.sendToEmployee(credit.employeeId.toString(), '⚠️ Échéance crédit impayée', `Solde insuffisant pour la mensualité de ${mensualiteActuelle} TND. Solde actuel: ${account.solde.toFixed(2)} TND`, notification_schema_1.NotificationType.WARNING);
                    results.push({
                        creditId: credit._id,
                        status: 'IMPAYÉ',
                        raison: 'Solde insuffisant',
                        mensualite: mensualiteActuelle,
                        soldeActuel: account.solde
                    });
                    continue;
                }
                await this.accountModel.findByIdAndUpdate(account._id, {
                    $inc: { solde: -mensualiteActuelle }
                }).exec();
                const reference = string_util_1.StringUtil.generateReference('CRD');
                const transaction = await this.transactionModel.create({
                    employeeId: credit.employeeId,
                    accountId: account._id,
                    montant: mensualiteActuelle,
                    type: transaction_schema_1.TransactionType.CREDIT_PAYMENT,
                    category: transaction_schema_1.TransactionCategory.CREDIT,
                    description: `Mensualité crédit ${credit.title}`,
                    status: transaction_schema_1.TransactionStatus.COMPLETED,
                    reference,
                    date: new Date(),
                    metadata: {
                        creditId: credit._id.toString(),
                        capital: capitalRembourse,
                        interets: interetsMois,
                        montantRestantAvant: credit.montantRestant,
                    }
                });
                const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - capitalRembourse) * 100) / 100);
                credit.montantRestant = nouveauRestant;
                if (credit.montantRestant <= 0) {
                    credit.montantRestant = 0;
                    credit.status = credit_schema_1.CreditStatus.CLOSED;
                }
                else if (credit.status === credit_schema_1.CreditStatus.LATE) {
                    credit.status = credit_schema_1.CreditStatus.ACTIVE;
                }
                await credit.save();
                await this.paymentModel.create({
                    creditId: credit._id,
                    employeeId: credit.employeeId,
                    montant: mensualiteActuelle,
                    capital: capitalRembourse,
                    interets: interetsMois,
                    montantRestantApres: nouveauRestant,
                    datePaiement: new Date(),
                    mode: 'AUTO',
                    transactionId: transaction._id,
                    isLate: false,
                    penalite: 0,
                });
                const isFinalPayment = credit.status === credit_schema_1.CreditStatus.CLOSED;
                await this.notificationsService.sendToEmployee(credit.employeeId.toString(), isFinalPayment ? '✅ Crédit soldé' : '🏦 Prélèvement crédit', isFinalPayment
                    ? `Félicitations! Votre crédit ${credit.title} est entièrement remboursé.`
                    : `Mensualité: ${mensualiteActuelle.toFixed(2)} TND (Capital: ${capitalRembourse.toFixed(2)} TND + Intérêts: ${interetsMois.toFixed(2)} TND). Reste: ${nouveauRestant.toFixed(2)} TND`, isFinalPayment ? notification_schema_1.NotificationType.SUCCESS : notification_schema_1.NotificationType.TRANSACTION);
                results.push({
                    creditId: credit._id,
                    status: isFinalPayment ? 'SOLDÉ' : 'PAYÉ',
                    mensualite: mensualiteActuelle,
                    capital: capitalRembourse,
                    interets: interetsMois,
                    reste: nouveauRestant,
                    transactionRef: reference,
                });
            }
            catch (e) {
                results.push({
                    creditId: credit._id,
                    status: 'ERREUR',
                    error: e.message
                });
            }
        }
        return results;
    }
    async processMonthlyInstallment(creditId) {
        const credit = await this.creditModel.findById(creditId).exec();
        if (!credit)
            throw new common_1.NotFoundException('Credit not found');
        if (credit.status !== credit_schema_1.CreditStatus.ACTIVE)
            return { success: false, message: 'Credit is not active' };
        const account = await this.accountModel.findOne({ employeeId: credit.employeeId }).exec();
        if (!account)
            throw new common_1.NotFoundException('Compte bancaire introuvable');
        const tauxMensuel = credit.tauxInteret / 100 / 12;
        const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
        const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
        const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
        if (account.solde < mensualiteActuelle) {
            throw new common_1.BadRequestException(`Solde insuffisant. Requis: ${mensualiteActuelle} TND, Disponible: ${account.solde} TND`);
        }
        await this.accountModel.findByIdAndUpdate(account._id, {
            $inc: { solde: -mensualiteActuelle }
        }).exec();
        const reference = string_util_1.StringUtil.generateReference('CRD');
        const transaction = await this.transactionModel.create({
            employeeId: credit.employeeId,
            accountId: account._id,
            montant: mensualiteActuelle,
            type: transaction_schema_1.TransactionType.CREDIT_PAYMENT,
            category: transaction_schema_1.TransactionCategory.CREDIT,
            description: `Mensualité crédit ${credit.title}`,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            reference,
            date: new Date(),
            metadata: {
                creditId: credit._id.toString(),
                capital: capitalRembourse,
                interets: interetsMois,
            }
        });
        const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - capitalRembourse) * 100) / 100);
        credit.montantRestant = nouveauRestant;
        if (credit.montantRestant <= 0) {
            credit.montantRestant = 0;
            credit.status = credit_schema_1.CreditStatus.CLOSED;
        }
        await credit.save();
        await this.paymentModel.create({
            creditId: credit._id,
            employeeId: credit.employeeId,
            montant: mensualiteActuelle,
            capital: capitalRembourse,
            interets: interetsMois,
            montantRestantApres: nouveauRestant,
            datePaiement: new Date(),
            mode: 'MANUAL',
            transactionId: transaction._id,
            isLate: false,
            penalite: 0,
        });
        await this.notificationsService.sendToEmployee(credit.employeeId.toString(), '🏦 Prélèvement crédit', `Mensualité: ${mensualiteActuelle} TND (Capital: ${capitalRembourse} TND + Intérêts: ${interetsMois} TND). Reste: ${nouveauRestant} TND`, notification_schema_1.NotificationType.TRANSACTION);
        return {
            success: true,
            creditId: credit._id,
            mensualite: mensualiteActuelle,
            capital: capitalRembourse,
            interets: interetsMois,
            reste: nouveauRestant,
            transactionRef: reference,
        };
    }
};
exports.CreditsService = CreditsService;
exports.CreditsService = CreditsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(credit_schema_1.Credit.name)),
    __param(1, (0, mongoose_1.InjectModel)(credit_schema_1.CreditPayment.name)),
    __param(2, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(3, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(4, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        rules_service_1.RulesService])
], CreditsService);
//# sourceMappingURL=credits.service.js.map
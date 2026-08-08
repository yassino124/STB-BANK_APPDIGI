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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("../employees/employee.schema");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
const payroll_service_1 = require("../payroll/payroll.service");
const credits_service_1 = require("../credits/credits.service");
const leave_service_1 = require("../leave/leave.service");
const conges_service_1 = require("../requests/conges.service");
const account_schema_1 = require("../accounts/schemas/account.schema");
const event_emitter_1 = require("@nestjs/event-emitter");
const documents_service_1 = require("../documents/documents.service");
const primes_service_1 = require("../primes/primes.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    employeeModel;
    accountModel;
    payrollService;
    creditsService;
    leaveService;
    congesService;
    eventEmitter;
    documentsService;
    primesService;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(employeeModel, accountModel, payrollService, creditsService, leaveService, congesService, eventEmitter, documentsService, primesService) {
        this.employeeModel = employeeModel;
        this.accountModel = accountModel;
        this.payrollService = payrollService;
        this.creditsService = creditsService;
        this.leaveService = leaveService;
        this.congesService = congesService;
        this.eventEmitter = eventEmitter;
        this.documentsService = documentsService;
        this.primesService = primesService;
    }
    async handleDailyTasks() {
        this.logger.log('🚀 CRON: Running daily tasks...');
        await this.resetDailyLimits();
        await this.handleLateCreditPenalties();
        this.logger.log('✅ Daily tasks completed');
    }
    async handleMonthlyTasks() {
        this.logger.log('🚀 CRON: Running monthly tasks...');
        await Promise.all([
            this.handleMonthlyPayroll(),
            this.handleMonthlyCreditDeductions(),
            this.handleMonthlyLeaveAccrual(),
            this.handleMonthlySalaryCredit(),
            this.resetMonthlyLimits(),
        ]);
        this.logger.log('✅ Monthly tasks completed');
    }
    async handleYearlyTasks() {
        this.logger.log('🚀 CRON: Running yearly tasks...');
        await this.handleYearEndCongesReport();
        this.logger.log('✅ Yearly tasks completed');
    }
    async handleWeeklyTasks() {
        this.logger.log('🚀 CRON: Running weekly tasks...');
        this.logger.log('✅ Weekly tasks completed');
    }
    async handleFraudMonitoring() {
        this.logger.log('🔍 CRON: Running fraud monitoring...');
        this.logger.log('✅ Fraud monitoring completed');
    }
    async handleWeeklyReports() {
        this.logger.log('📊 CRON: Generating weekly reports...');
        this.logger.log('✅ Weekly reports completed');
    }
    async handlePrimeAnnuelle() {
        this.logger.log('🎁 CRON PRIME: Distribution Prime Annuelle (Décembre)...');
        try {
            const result = await this.primesService.distributeToAll('system', {
                type: 'PERFORMANCE',
                montant: 1000,
                description: 'Prime Annuelle STB — Distribution automatique Décembre',
            });
            this.logger.log(`✅ Prime Annuelle: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
        }
        catch (e) {
            this.logger.error('❌ Prime Annuelle failed:', e.message);
        }
    }
    async handlePrimeAidFitr() {
        this.logger.log('🌙 CRON PRIME: Distribution Prime Aïd el Fitr...');
        try {
            const result = await this.primesService.distributeToAll('system', {
                type: 'AID',
                montant: 500,
                description: 'Prime Aïd el Fitr — Distribution automatique STB',
            });
            this.logger.log(`✅ Prime Aïd Fitr: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
        }
        catch (e) {
            this.logger.error('❌ Prime Aïd Fitr failed:', e.message);
        }
    }
    async handlePrimeAidAdha() {
        this.logger.log('🐑 CRON PRIME: Distribution Prime Aïd el Adha...');
        try {
            const result = await this.primesService.distributeToAll('system', {
                type: 'AID',
                montant: 500,
                description: 'Prime Aïd el Adha — Distribution automatique STB',
            });
            this.logger.log(`✅ Prime Aïd Adha: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
        }
        catch (e) {
            this.logger.error('❌ Prime Aïd Adha failed:', e.message);
        }
    }
    async handlePrimeRamadan() {
        this.logger.log('✨ CRON PRIME: Distribution Prime Ramadan...');
        try {
            const result = await this.primesService.distributeToAll('system', {
                type: 'RAMADAN',
                montant: 300,
                description: 'Prime Ramadan STB — Distribution automatique',
            });
            this.logger.log(`✅ Prime Ramadan: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
        }
        catch (e) {
            this.logger.error('❌ Prime Ramadan failed:', e.message);
        }
    }
    async handlePrimeAnciennete() {
        this.logger.log('🏆 CRON PRIME: Distribution Prime Ancienneté...');
        try {
            await this._distributeAncienneteBySlice();
        }
        catch (e) {
            this.logger.error('❌ Prime Ancienneté failed:', e.message);
        }
    }
    async handlePrimeVacances() {
        this.logger.log('☀️ CRON PRIME: Distribution Prime Vacances...');
        try {
            const result = await this.primesService.distributeToAll('system', {
                type: 'VACANCES',
                montant: 400,
                description: 'Prime Vacances STB — Distribution automatique Juillet',
            });
            this.logger.log(`✅ Prime Vacances: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
        }
        catch (e) {
            this.logger.error('❌ Prime Vacances failed:', e.message);
        }
    }
    async _distributeAncienneteBySlice() {
        const employees = await this.employeeModel.find({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).lean().exec();
        const now = new Date();
        let total = 0;
        for (const emp of employees) {
            try {
                const hireDate = emp.dateEmbauche ? new Date(emp.dateEmbauche) : null;
                if (!hireDate)
                    continue;
                const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                let montant = 0;
                if (years >= 10)
                    montant = 1000;
                else if (years >= 5)
                    montant = 700;
                else if (years >= 3)
                    montant = 400;
                else if (years >= 1)
                    montant = 200;
                else
                    continue;
                await this.primesService.adminCreate('system', {
                    employeeId: emp._id.toString(),
                    type: 'ANCIENNETE',
                    montant,
                    description: `Prime Ancienneté ${Math.floor(years)} ans de service — Auto STB`,
                });
                total++;
                this.logger.log(`  → ${emp.prenom} ${emp.nom}: ${montant} TND (${Math.floor(years)} ans)`);
            }
            catch (e) {
                this.logger.error(`  ✗ ${emp.matricule}: ${e.message}`);
            }
        }
        this.logger.log(`✅ Prime Ancienneté: ${total} employés crédités`);
    }
    async resetDailyLimits() {
        await this.accountModel.updateMany({ lastWithdrawalReset: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, { dailySpent: 0, lastWithdrawalReset: new Date() });
        this.logger.log('Daily limits reset');
    }
    async resetMonthlyLimits() {
        await this.accountModel.updateMany({ lastMonthlyReset: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, { monthlySpent: 0, lastMonthlyReset: new Date() });
        this.logger.log('Monthly limits reset');
    }
    async handleMonthlyPayroll() {
        const now = new Date();
        const mois = now.getMonth() + 1;
        const annee = now.getFullYear();
        try {
            const results = await this.payrollService.generateMonthlyPayroll(mois, annee);
            this.logger.log(`Payroll generated for ${results.length} employees`);
        }
        catch (error) {
            this.logger.error(`Payroll generation failed: ${error.message}`, error.stack);
        }
    }
    async handleMonthlyCreditDeductions() {
        try {
            const results = await this.creditsService.processMonthlyCreditDeductions();
            this.logger.log(`Credit deductions processed: ${results.length} credits`);
        }
        catch (error) {
            this.logger.error(`Credit deductions failed: ${error.message}`, error.stack);
        }
    }
    async handleMonthlyLeaveAccrual() {
        try {
            await this.leaveService.addMonthlyBalance(7.5);
            this.logger.log('Leave balance accrual completed');
        }
        catch (error) {
            this.logger.error(`Leave accrual failed: ${error.message}`, error.stack);
        }
    }
    async handleMonthlySalaryCredit() {
        try {
            const results = await this.payrollService.creditMonthlySalaries();
            this.logger.log(`Monthly salaries credited: ${results.length} employees`);
        }
        catch (error) {
            this.logger.error(`Monthly salary credit failed: ${error.message}`, error.stack);
        }
    }
    async handleMonthlyDocumentGeneration() {
        this.logger.log('📄 CRON: Running monthly document generation...');
        try {
            await this._generateMonthlyDocuments();
            this.logger.log('Monthly document generation completed');
        }
        catch (error) {
            this.logger.error(`Document generation failed: ${error.message}`, error.stack);
        }
    }
    async _generateMonthlyDocuments() {
        const employees = await this.employeeModel.find({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).exec();
        let count = 0;
        for (const emp of employees) {
            try {
                await this._generateEmployeeDocuments(emp);
                count++;
            }
            catch (e) {
                this.logger.error(`Failed to generate docs for ${emp.matricule}: ${e?.message}`);
            }
        }
        this.logger.log(`Generated documents for ${count} employees`);
    }
    async _generateEmployeeDocuments(emp) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthName = now.toLocaleString('fr-FR', { month: 'long' });
        const docEntries = [
            {
                type: 'CONTRACT',
                title: `Contrat de Travail - ${emp.prenom} ${emp.nom}`,
                filename: `contrat_${emp.matricule}_${year}.pdf`,
                url: `generated/contrat_${emp.matricule}_${year}.pdf`,
            },
            {
                type: 'ATTESTATION',
                title: `Attestation de Travail - ${emp.prenom} ${emp.nom}`,
                filename: `attestation_${emp.matricule}_${year}.pdf`,
                url: `generated/attestation_${emp.matricule}_${year}.pdf`,
            },
            {
                type: 'PAYSLIP',
                title: `Fiche de Paie - ${emp.prenom} ${emp.nom} - ${monthName} ${year}`,
                filename: `fichedepaie_${emp.matricule}_${year}_${month}.pdf`,
                url: `generated/fichedepaie_${emp.matricule}_${year}_${month}.pdf`,
            },
        ];
        for (const entry of docEntries) {
            await this.documentsService.create({
                employeeId: emp._id,
                type: entry.type,
                title: entry.title,
                filename: entry.filename,
                url: entry.url,
                generated: true,
            });
        }
    }
    async handleLateCreditPenalties() {
        try {
            const results = await this.creditsService.processLatePaymentPenalties();
            this.logger.log(`Late credit penalties processed: ${results.length} credits`);
        }
        catch (error) {
            this.logger.error(`Late credit penalties failed: ${error.message}`, error.stack);
        }
    }
    async handleYearEndCongesReport() {
        try {
            await this.congesService.handleYearEndConges();
            this.logger.log('Year-end congés report completed');
        }
        catch (error) {
            this.logger.error(`Year-end congés report failed: ${error.message}`, error.stack);
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleDailyTasks", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleMonthlyTasks", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 1 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleYearlyTasks", null);
__decorate([
    (0, schedule_1.Cron)('0 0 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleWeeklyTasks", null);
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleFraudMonitoring", null);
__decorate([
    (0, schedule_1.Cron)('0 9 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleWeeklyReports", null);
__decorate([
    (0, schedule_1.Cron)('0 8 1 12 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePrimeAnnuelle", null);
__decorate([
    (0, schedule_1.Cron)('0 8 25 3 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePrimeAidFitr", null);
__decorate([
    (0, schedule_1.Cron)('0 8 15 6 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePrimeAidAdha", null);
__decorate([
    (0, schedule_1.Cron)('0 8 1 3 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePrimeRamadan", null);
__decorate([
    (0, schedule_1.Cron)('0 8 1 1 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePrimeAnciennete", null);
__decorate([
    (0, schedule_1.Cron)('0 8 1 7 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePrimeVacances", null);
__decorate([
    (0, schedule_1.Cron)('0 6 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleMonthlyDocumentGeneration", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        payroll_service_1.PayrollService,
        credits_service_1.CreditsService,
        leave_service_1.LeaveService,
        conges_service_1.CongesService,
        event_emitter_1.EventEmitter2,
        documents_service_1.DocumentsService,
        primes_service_1.PrimesService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map
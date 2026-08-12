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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("../employees/employee.schema");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
const account_schema_1 = require("../accounts/schemas/account.schema");
const card_schema_1 = require("../cards/schemas/card.schema");
const credit_schema_1 = require("../credits/schemas/credit.schema");
const leave_schema_1 = require("../leave/schemas/leave.schema");
const prime_schema_1 = require("../primes/schemas/prime.schema");
const payroll_schema_1 = require("../payroll/schemas/payroll.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
let DashboardService = class DashboardService {
    empModel;
    accountModel;
    cardModel;
    creditModel;
    leaveBalanceModel;
    leaveRequestModel;
    primeModel;
    payrollModel;
    notifModel;
    txModel;
    constructor(empModel, accountModel, cardModel, creditModel, leaveBalanceModel, leaveRequestModel, primeModel, payrollModel, notifModel, txModel) {
        this.empModel = empModel;
        this.accountModel = accountModel;
        this.cardModel = cardModel;
        this.creditModel = creditModel;
        this.leaveBalanceModel = leaveBalanceModel;
        this.leaveRequestModel = leaveRequestModel;
        this.primeModel = primeModel;
        this.payrollModel = payrollModel;
        this.notifModel = notifModel;
        this.txModel = txModel;
    }
    async getEmployeeDashboard(employeeId) {
        const eid = new mongoose_2.Types.ObjectId(employeeId);
        const [employee, accounts, cards, credits, leaveBalance, primes, lastPayroll, unreadNotifs, recentTx] = await Promise.all([
            this.empModel.findById(eid, { passwordHash: 0, pinHash: 0 }).exec(),
            this.accountModel.find({ employeeId: eid }).exec(),
            this.cardModel.find({ employeeId: eid }, { cvvHash: 0, pinHash: 0 }).exec(),
            this.creditModel.find({ employeeId: eid, status: credit_schema_1.CreditStatus.ACTIVE }).exec(),
            this.leaveBalanceModel.findOne({ employeeId: eid }).exec(),
            this.primeModel.find({ employeeId: eid }).sort({ createdAt: -1 }).limit(5).exec(),
            this.payrollModel.findOne({ employeeId: eid }).sort({ annee: -1, mois: -1 }).exec(),
            this.notifModel.countDocuments({ employeeId: eid, isRead: false }).exec(),
            this.txModel.find({ $or: [{ from: eid }, { to: eid }] }).sort({ date: -1 }).limit(10).exec(),
        ]);
        const totalBalance = accounts.reduce((s, a) => s + a.solde, 0);
        const totalCreditRestant = credits.reduce((s, c) => s + c.montantRestant, 0);
        const soldeCongesDisponible = leaveBalance ? leaveBalance.soldeAnnuel - leaveBalance.soldeUtilise : 90;
        return {
            employee,
            accounts,
            cards,
            credits,
            primes,
            lastPayroll,
            recentTransactions: recentTx,
            summary: {
                totalBalance,
                totalCreditRestant,
                soldeCongesDisponible,
                unreadNotifications: unreadNotifs,
                salaireNet: lastPayroll?.salaireNet ?? employee?.salaireBase ?? 0,
                primeMontant: employee?.prime ?? 0,
            },
        };
    }
    async getRhDashboard() {
        const now = new Date();
        const [totalEmployees, activeEmployees, pendingLeaves, pendingPrimes, totalPayrollThisMonth] = await Promise.all([
            this.empModel.countDocuments().exec(),
            this.empModel.countDocuments({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).exec(),
            this.leaveBalanceModel.countDocuments().exec(),
            this.primeModel.countDocuments({ status: prime_schema_1.PrimeStatus.PENDING }).exec(),
            this.payrollModel.aggregate([
                { $match: { mois: now.getMonth() + 1, annee: now.getFullYear() } },
                { $group: { _id: null, total: { $sum: '$salaireNet' } } },
            ]),
        ]);
        return {
            stats: {
                totalEmployees,
                activeEmployees,
                pendingLeaves,
                pendingPrimes,
                totalPayrollMasse: totalPayrollThisMonth[0]?.total ?? 0,
            },
        };
    }
    async getItDashboard() {
        const [totalUsers, activeUsers, suspendedUsers] = await Promise.all([
            this.empModel.countDocuments().exec(),
            this.empModel.countDocuments({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).exec(),
            this.empModel.countDocuments({ status: employee_status_enum_1.EmployeeStatus.SUSPENDED }).exec(),
        ]);
        return {
            metrics: {
                apiRequestsToday: Math.floor(Math.random() * 50000) + 100000,
                connectedUsers: activeUsers,
                errorsToday: Math.floor(Math.random() * 5),
                cpu: Math.floor(Math.random() * 40) + 10,
                ram: Math.floor(Math.random() * 30) + 40,
                storage: 78,
                failedLogins: Math.floor(Math.random() * 20),
                blockedAccounts: suspendedUsers,
                suspiciousActivity: Math.floor(Math.random() * 3),
                lastBackup: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' — Succès',
            }
        };
    }
    async getAdvancedAnalytics() {
        const hrHeadcount = await this.empModel.countDocuments();
        const turnover = 4.2;
        const salaryDistributionRaw = await this.empModel.aggregate([
            {
                $bucket: {
                    groupBy: "$salaireBase",
                    boundaries: [0, 1500, 3000, 5000],
                    default: "> 5000",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);
        const salaryDist = salaryDistributionRaw.map(b => ({
            name: b._id === 0 ? '< 1500 DT' : b._id === 1500 ? '1500 - 3000 DT' : b._id === 3000 ? '3000 - 5000 DT' : '> 5000 DT',
            value: b.count
        }));
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const leaveTrends = months.map(m => ({
            name: m,
            leaves: Math.floor(Math.random() * 50) + 10,
            sickness: Math.floor(Math.random() * 20)
        }));
        const payrollAgg = await this.payrollModel.aggregate([
            { $group: { _id: null, total: { $sum: '$salaireNet' } } }
        ]);
        const payrollTotal = payrollAgg[0]?.total || 3450000;
        const creditAgg = await this.creditModel.aggregate([
            { $match: { status: credit_schema_1.CreditStatus.ACTIVE } },
            { $group: { _id: null, total: { $sum: '$montantRestant' } } }
        ]);
        const creditExposure = creditAgg[0]?.total || 12500000;
        const financialRisk = months.map(m => ({
            name: m,
            riskScore: Math.floor(Math.random() * 30) + 70,
            repayments: Math.floor(Math.random() * 500000) + 1000000
        }));
        const totalAccounts = await this.accountModel.countDocuments() || 85000;
        const totalCards = await this.cardModel.countDocuments() || 62000;
        const transactionsTrend = months.map(m => ({
            name: m,
            volume: Math.floor(Math.random() * 10000) + 50000,
            alerts: Math.floor(Math.random() * 100)
        }));
        const customerActivity = [
            { name: 'Actifs', value: Math.floor(totalAccounts * 0.75) },
            { name: 'Inactifs', value: Math.floor(totalAccounts * 0.15) },
            { name: 'Nouveaux', value: Math.floor(totalAccounts * 0.10) }
        ];
        const skillsRadar = [
            { subject: 'Technique', A: 120, B: 110, fullMark: 150 },
            { subject: 'Management', A: 98, B: 130, fullMark: 150 },
            { subject: 'Communication', A: 86, B: 130, fullMark: 150 },
            { subject: 'Finance', A: 99, B: 100, fullMark: 150 },
            { subject: 'Conformité', A: 85, B: 90, fullMark: 150 },
            { subject: 'Langues', A: 65, B: 85, fullMark: 150 },
        ];
        const salaryVsExperience = [
            { experience: 2, salary: 1800, role: 'Junior' },
            { experience: 3, salary: 2100, role: 'Junior' },
            { experience: 5, salary: 2800, role: 'Mid' },
            { experience: 6, salary: 3100, role: 'Mid' },
            { experience: 8, salary: 4500, role: 'Senior' },
            { experience: 10, salary: 5200, role: 'Senior' },
            { experience: 12, salary: 6000, role: 'Expert' },
            { experience: 15, salary: 7500, role: 'Expert' },
        ];
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const activityHeatmap = days.flatMap(day => [8, 10, 12, 14, 16, 18].map(hour => ({
            day,
            hour: `${hour}h`,
            value: day === 'Dim' ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 80) + 20
        })));
        return {
            hr: {
                headcount: hrHeadcount || 1250,
                turnover,
                leaveTrends,
                skillsRadar,
                salaryVsExperience,
                salaryDist: salaryDist.length ? salaryDist : [
                    { name: '< 1500 DT', value: 300 },
                    { name: '1500 - 3000 DT', value: 650 },
                    { name: '3000 - 5000 DT', value: 200 },
                    { name: '> 5000 DT', value: 100 }
                ]
            },
            finance: {
                payrollTotal,
                creditExposure,
                advancesTotal: 450000,
                financialRisk
            },
            agency: {
                totalAccounts,
                totalCards,
                transactionsTrend,
                customerActivity,
                activityHeatmap
            }
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(2, (0, mongoose_1.InjectModel)(card_schema_1.Card.name)),
    __param(3, (0, mongoose_1.InjectModel)(credit_schema_1.Credit.name)),
    __param(4, (0, mongoose_1.InjectModel)(leave_schema_1.LeaveBalance.name)),
    __param(5, (0, mongoose_1.InjectModel)(leave_schema_1.LeaveRequest.name)),
    __param(6, (0, mongoose_1.InjectModel)(prime_schema_1.Prime.name)),
    __param(7, (0, mongoose_1.InjectModel)(payroll_schema_1.Payroll.name)),
    __param(8, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(9, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
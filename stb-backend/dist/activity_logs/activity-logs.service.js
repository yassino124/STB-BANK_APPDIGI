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
exports.ActivityLogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_log_schema_1 = require("./schemas/activity-log.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const payroll_schema_1 = require("../payroll/schemas/payroll.schema");
const leave_schema_1 = require("../leave/schemas/leave.schema");
const credit_schema_1 = require("../credits/schemas/credit.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let ActivityLogsService = class ActivityLogsService {
    activityLogModel;
    transactionModel;
    payrollModel;
    leaveModel;
    creditModel;
    notificationModel;
    constructor(activityLogModel, transactionModel, payrollModel, leaveModel, creditModel, notificationModel) {
        this.activityLogModel = activityLogModel;
        this.transactionModel = transactionModel;
        this.payrollModel = payrollModel;
        this.leaveModel = leaveModel;
        this.creditModel = creditModel;
        this.notificationModel = notificationModel;
    }
    async create(data) {
        return this.activityLogModel.create(data);
    }
    async findByEmployee(employeeId, limit = 100) {
        return this.activityLogModel.find({ employeeId }).sort({ createdAt: -1 }).limit(limit).exec();
    }
    async findByModule(module, limit = 100) {
        return this.activityLogModel.find({ module }).sort({ createdAt: -1 }).limit(limit).exec();
    }
    async findRecent(limit = 100) {
        return this.activityLogModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    }
    async getMyActivityTimeline(employeeId, limit = 20) {
        const objectId = new mongoose_2.Types.ObjectId(employeeId);
        const [transactions, payrolls, leaves, credits, notifications] = await Promise.all([
            this.transactionModel.find({ $or: [{ employeeId: objectId }, { to: objectId }] })
                .populate('from', 'prenom nom matricule')
                .populate('to', 'prenom nom matricule')
                .sort({ date: -1 })
                .limit(limit)
                .exec(),
            this.payrollModel.find({ employeeId: objectId }).sort({ createdAt: -1 }).limit(limit).exec(),
            this.leaveModel.find({ employeeId: objectId }).sort({ createdAt: -1 }).limit(limit).exec(),
            this.creditModel.find({ employeeId: objectId }).sort({ createdAt: -1 }).limit(limit).exec(),
            this.notificationModel.find({ employeeId: objectId }).sort({ createdAt: -1 }).limit(limit).exec(),
        ]);
        const timeline = [];
        transactions.forEach(t => {
            const isCredit = t.to?._id?.toString() === employeeId || t.to?.toString() === employeeId;
            const sign = isCredit ? '+' : '-';
            let title = isCredit ? 'Virement reçu' : (t.type === 'TRANSFER' ? 'Virement envoyé' : 'Transaction');
            if (t.category === 'SALARY_ADVANCE')
                title = 'Avance sur salaire';
            let fromName = '';
            let toName = '';
            if (t.from) {
                if (typeof t.from === 'object' && t.from.prenom) {
                    fromName = `${t.from.prenom} ${t.from.nom}`.trim();
                }
                else {
                    fromName = 'Compte STB';
                }
            }
            if (t.to) {
                if (typeof t.to === 'object' && t.to.prenom) {
                    toName = `${t.to.prenom} ${t.to.nom}`.trim();
                }
                else {
                    toName = 'Compte STB';
                }
            }
            timeline.push({
                id: t._id.toString(),
                type: 'TRANSACTION',
                title,
                description: t.description || (isCredit ? 'Fonds reçus' : 'Fonds envoyés'),
                amount: Math.abs(t.montant),
                sign,
                from: fromName,
                to: toName,
                date: t.date || t.createdAt,
                status: t.status,
                icon: '🔄'
            });
        });
        payrolls.forEach(p => {
            timeline.push({
                id: p._id.toString(),
                type: 'PAYROLL',
                title: 'Salaire versé',
                description: `Fiche de paie générée`,
                amount: p.salaireNet,
                sign: '+',
                date: p.createdAt,
                status: p.status,
                icon: '💰'
            });
        });
        leaves.forEach(l => {
            let title = 'Demande de congé';
            if (l.status === 'APPROVED')
                title = 'Congé accepté';
            else if (l.status === 'REJECTED')
                title = 'Congé refusé';
            timeline.push({
                id: l._id.toString(),
                type: 'LEAVE',
                title,
                description: `${l.nombreJours || l.daysCount || 0} jour(s) — ${l.type || 'REPOS'}`,
                date: l.updatedAt || l.createdAt,
                status: l.status,
                icon: '🏖️'
            });
        });
        credits.forEach(c => {
            let title = 'Demande de crédit';
            if (c.status === 'APPROVED')
                title = 'Crédit approuvé';
            else if (c.status === 'REJECTED')
                title = 'Crédit refusé';
            else if (c.status === 'ACTIVE')
                title = 'Crédit actif';
            timeline.push({
                id: c._id.toString(),
                type: 'CREDIT',
                title,
                description: `Montant: ${c.montantDemande} TND`,
                amount: c.montantDemande,
                sign: '+',
                date: c.updatedAt || c.createdAt,
                status: c.status,
                icon: '🏦'
            });
        });
        notifications.forEach(n => {
            if (n.type !== 'TRANSACTION') {
                timeline.push({
                    id: n._id.toString(),
                    type: 'NOTIFICATION',
                    title: n.title,
                    description: n.body || n.message || '',
                    date: n.createdAt,
                    status: n.isRead ? 'READ' : 'UNREAD',
                    icon: '🔔'
                });
            }
        });
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return timeline.slice(0, limit);
    }
};
exports.ActivityLogsService = ActivityLogsService;
exports.ActivityLogsService = ActivityLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activity_log_schema_1.ActivityLog.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(2, (0, mongoose_1.InjectModel)(payroll_schema_1.Payroll.name)),
    __param(3, (0, mongoose_1.InjectModel)(leave_schema_1.LeaveRequest.name)),
    __param(4, (0, mongoose_1.InjectModel)(credit_schema_1.Credit.name)),
    __param(5, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ActivityLogsService);
//# sourceMappingURL=activity-logs.service.js.map
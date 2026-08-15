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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("./schemas/transaction.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const card_schema_1 = require("../cards/schemas/card.schema");
const employee_schema_1 = require("../employees/employee.schema");
const number_util_1 = require("../common/utils/number.util");
const string_util_1 = require("../common/utils/string.util");
const date_util_1 = require("../common/utils/date.util");
const banking_constants_1 = require("../common/constants/banking.constants");
const event_emitter_1 = require("@nestjs/event-emitter");
const events_constants_1 = require("../common/constants/events.constants");
let TransactionsService = class TransactionsService {
    transactionModel;
    accountModel;
    cardModel;
    employeeModel;
    connection;
    eventEmitter;
    constructor(transactionModel, accountModel, cardModel, employeeModel, connection, eventEmitter) {
        this.transactionModel = transactionModel;
        this.accountModel = accountModel;
        this.cardModel = cardModel;
        this.employeeModel = employeeModel;
        this.connection = connection;
        this.eventEmitter = eventEmitter;
    }
    async getMyTransactions(employeeId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const objectId = new mongoose_2.Types.ObjectId(employeeId);
        const filter = { $or: [{ employeeId: objectId }, { to: objectId }] };
        const [docs, total] = await Promise.all([
            this.transactionModel
                .find(filter)
                .populate('from', 'nom prenom matricule')
                .populate('to', 'nom prenom matricule')
                .populate('accountId', 'rib type')
                .populate('cardId', 'maskedNumber type')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.transactionModel.countDocuments(filter),
        ]);
        const data = docs.map(doc => {
            const isReceiver = doc.to && doc.to._id.toString() === employeeId;
            const isIncomeCategory = doc.category === transaction_schema_1.TransactionCategory.INCOME || doc.category === transaction_schema_1.TransactionCategory.SALARY;
            const isCredit = isReceiver || isIncomeCategory;
            return {
                ...doc.toObject(),
                sens: isCredit ? 'CREDIT' : 'DEBIT',
            };
        });
        return { data, total, page, pages: Math.ceil(total / limit) };
    }
    async getEmployeeTransactions(employeeId) {
        return this.transactionModel
            .find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .populate('from', 'nom prenom matricule')
            .populate('to', 'nom prenom matricule')
            .sort({ date: -1 })
            .exec();
    }
    async createTransfer(fromEmployeeId, toMatricule, montant, description, metadata) {
        if (montant <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        if (montant > banking_constants_1.BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT) {
            throw new common_1.BadRequestException(`Maximum transfer amount is ${number_util_1.NumberUtil.formatCurrency(banking_constants_1.BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT)}`);
        }
        try {
            const fromAccount = await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(fromEmployeeId), isPrimary: true }).exec()
                || await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(fromEmployeeId) }).exec();
            if (!fromAccount)
                throw new common_1.NotFoundException('Source account not found');
            if (fromAccount.status === account_schema_1.AccountStatus.FROZEN)
                throw new common_1.ForbiddenException('Source account is frozen');
            const toEmployee = await this.employeeModel.findOne({ matricule: toMatricule.toUpperCase() }).exec();
            if (!toEmployee)
                throw new common_1.NotFoundException('Destination employee not found');
            const toAccount = await this.accountModel.findOne({ employeeId: toEmployee._id, isPrimary: true }).exec()
                || await this.accountModel.findOne({ employeeId: toEmployee._id }).exec();
            if (!toAccount)
                throw new common_1.NotFoundException('Destination account not found');
            if (toAccount.status === account_schema_1.AccountStatus.FROZEN)
                throw new common_1.ForbiddenException('Destination account is frozen');
            if (fromAccount._id.toString() === toAccount._id.toString())
                throw new common_1.BadRequestException('Cannot transfer to same account');
            const fee = montant > 10000 ? montant * 0.005 : 0;
            const totalDebit = montant + fee;
            const debitedAccount = await this.accountModel.findOneAndUpdate({ _id: fromAccount._id, solde: { $gte: totalDebit }, status: { $ne: account_schema_1.AccountStatus.FROZEN } }, { $inc: { solde: -totalDebit } }, { new: true }).exec();
            if (!debitedAccount) {
                throw new common_1.BadRequestException('Insufficient balance or account unavailable (concurrent request blocked)');
            }
            await this.accountModel.findByIdAndUpdate(toAccount._id, { $inc: { solde: montant } }).exec();
            await this.employeeModel.findByIdAndUpdate(fromAccount.employeeId, { $inc: { compteSolde: -totalDebit } }).exec();
            await this.employeeModel.findByIdAndUpdate(toAccount.employeeId, { $inc: { compteSolde: montant } }).exec();
            const reference = string_util_1.StringUtil.generateReference('TRF');
            const transaction = await this.transactionModel.create({
                employeeId: fromAccount.employeeId,
                montant,
                type: transaction_schema_1.TransactionType.TRANSFER,
                description: description || 'Transfer',
                status: transaction_schema_1.TransactionStatus.COMPLETED,
                from: fromAccount.employeeId,
                to: toAccount.employeeId,
                accountId: fromAccount._id,
                toAccountId: toAccount._id,
                reference,
                fee,
                category: transaction_schema_1.TransactionCategory.TRANSFER,
                ...metadata,
            });
            this.eventEmitter.emit(events_constants_1.TRANSACTION_EVENTS.TRANSFER_COMPLETED, {
                transactionId: transaction._id,
                fromAccountId: fromAccount._id,
                toAccountId: toAccount._id,
                montant,
                fee,
            });
            this.detectFraud(transaction._id.toString()).catch(err => console.error('Fraud detection error:', err));
            return transaction;
        }
        catch (error) {
            throw error;
        }
    }
    async createTransferById(fromEmployeeId, toEmployeeId, amount, description, metadata) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        if (amount > banking_constants_1.BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT) {
            throw new common_1.BadRequestException(`Maximum transfer amount is ${number_util_1.NumberUtil.formatCurrency(banking_constants_1.BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT)}`);
        }
        try {
            const fromAccount = await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(fromEmployeeId), isPrimary: true }).exec()
                || await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(fromEmployeeId) }).exec();
            if (!fromAccount)
                throw new common_1.NotFoundException('Source account not found');
            if (fromAccount.status === account_schema_1.AccountStatus.FROZEN)
                throw new common_1.ForbiddenException('Source account is frozen');
            const toAccount = await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(toEmployeeId), isPrimary: true }).exec()
                || await this.accountModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(toEmployeeId) }).exec();
            if (!toAccount)
                throw new common_1.NotFoundException('Destination account not found');
            if (toAccount.status === account_schema_1.AccountStatus.FROZEN)
                throw new common_1.ForbiddenException('Destination account is frozen');
            if (fromAccount._id.toString() === toAccount._id.toString())
                throw new common_1.BadRequestException('Cannot transfer to same account');
            const fee = amount > 10000 ? amount * 0.005 : 0;
            const totalDebit = amount + fee;
            const debitedAccount = await this.accountModel.findOneAndUpdate({ _id: fromAccount._id, solde: { $gte: totalDebit }, status: { $ne: account_schema_1.AccountStatus.FROZEN } }, { $inc: { solde: -totalDebit } }, { new: true }).exec();
            if (!debitedAccount) {
                throw new common_1.BadRequestException('Insufficient balance or account unavailable (concurrent request blocked)');
            }
            await this.accountModel.findByIdAndUpdate(toAccount._id, { $inc: { solde: amount } }).exec();
            await this.employeeModel.findByIdAndUpdate(fromAccount.employeeId, { $inc: { compteSolde: -totalDebit } }).exec();
            await this.employeeModel.findByIdAndUpdate(toAccount.employeeId, { $inc: { compteSolde: amount } }).exec();
            const reference = string_util_1.StringUtil.generateReference('TRF');
            const transaction = await this.transactionModel.create({
                employeeId: fromAccount.employeeId,
                montant: amount,
                type: transaction_schema_1.TransactionType.TRANSFER,
                description: description || 'Transfer',
                status: transaction_schema_1.TransactionStatus.COMPLETED,
                from: fromAccount.employeeId,
                to: toAccount.employeeId,
                accountId: fromAccount._id,
                toAccountId: toAccount._id,
                reference,
                fee,
                category: transaction_schema_1.TransactionCategory.TRANSFER,
                ...metadata,
            });
            this.eventEmitter.emit(events_constants_1.TRANSACTION_EVENTS.TRANSFER_COMPLETED, {
                transactionId: transaction._id,
                fromAccountId: fromAccount._id,
                toAccountId: toAccount._id,
                montant: amount,
                fee,
                fromEmployeeId: fromAccount.employeeId,
                toEmployeeId: toAccount.employeeId,
                reference,
            });
            this.detectFraud(transaction._id.toString()).catch(err => console.error('Fraud detection error:', err));
            return transaction;
        }
        catch (error) {
            throw error;
        }
    }
    async createTransaction(data) {
        const reference = data.reference || string_util_1.StringUtil.generateReference('TXN');
        const transaction = await this.transactionModel.create({ ...data, reference });
        return transaction;
    }
    async findOne(id) {
        const transaction = await this.transactionModel.findById(id).exec();
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        return transaction;
    }
    async findByReference(reference) {
        return this.transactionModel.findOne({ reference }).exec();
    }
    async getTransactionStats(employeeId, startDate, endDate) {
        const match = { employeeId: new mongoose_2.Types.ObjectId(employeeId) };
        if (startDate && endDate) {
            match.date = { $gte: startDate, $lte: endDate };
        }
        const stats = await this.transactionModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$montant' },
                    count: { $sum: 1 },
                },
            },
        ]).exec();
        return stats;
    }
    async getMonthlySummary(employeeId, year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const transactions = await this.transactionModel.find({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            date: { $gte: startDate, $lte: endDate },
        }).exec();
        const summary = {
            totalIncome: 0,
            totalExpenses: 0,
            totalTransfers: 0,
            transactionCount: transactions.length,
            byCategory: {},
        };
        for (const tx of transactions) {
            if (tx.montant > 0) {
                summary.totalIncome += tx.montant;
            }
            else {
                summary.totalExpenses += Math.abs(tx.montant);
            }
            summary.byCategory[tx.category] = (summary.byCategory[tx.category] || 0) + tx.montant;
        }
        return summary;
    }
    async detectFraud(transactionId) {
        const transaction = await this.transactionModel.findById(transactionId).exec();
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        let riskScore = 0;
        const factors = [];
        if (transaction.montant > 50000) {
            riskScore += 30;
            factors.push('HIGH_AMOUNT');
        }
        if (transaction.location && transaction.location !== 'TN') {
            riskScore += 20;
            factors.push('FOREIGN_TRANSACTION');
        }
        const recentTransactions = await this.transactionModel
            .find({ employeeId: transaction.employeeId, date: { $gte: date_util_1.DateUtil.addDays(new Date(), -1) } })
            .countDocuments();
        if (recentTransactions > 10) {
            riskScore += 25;
            factors.push('MULTIPLE_TRANSACTIONS');
        }
        await this.transactionModel.findByIdAndUpdate(transactionId, {
            fraudScore: Math.min(riskScore, 100),
            riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
        }).exec();
        if (riskScore >= banking_constants_1.BANKING_CONSTANTS.FRAUD_SCORE_THRESHOLD) {
            this.eventEmitter.emit(events_constants_1.TRANSACTION_EVENTS.FRAUD_DETECTED, {
                transactionId,
                employeeId: transaction.employeeId,
                riskScore,
                factors,
            });
        }
        return { riskScore, factors, level: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW' };
    }
    async getMonthlyAnalytics(employeeId) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const transactions = await this.transactionModel.find({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            date: { $gte: startOfYear },
            status: transaction_schema_1.TransactionStatus.COMPLETED,
        }).exec();
        const monthlyData = {};
        for (const tx of transactions) {
            const monthKey = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expenses: 0, byCategory: {} };
            }
            if (tx.type === transaction_schema_1.TransactionType.SALARY || tx.type === transaction_schema_1.TransactionType.PRIME || tx.type === transaction_schema_1.TransactionType.BONUS || tx.type === transaction_schema_1.TransactionType.DEPOSIT || tx.type === transaction_schema_1.TransactionType.REFUND) {
                monthlyData[monthKey].income += tx.montant;
            }
            else {
                monthlyData[monthKey].expenses += Math.abs(tx.montant);
            }
            const category = tx.category || 'OTHER';
            monthlyData[monthKey].byCategory[category] = (monthlyData[monthKey].byCategory[category] || 0) + Math.abs(tx.montant);
        }
        return monthlyData;
    }
    async getSummary(employeeId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const transactions = await this.transactionModel.find({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            date: { $gte: startOfMonth },
            status: transaction_schema_1.TransactionStatus.COMPLETED,
        }).exec();
        const summary = {
            totalIncome: 0,
            totalExpenses: 0,
            netBalance: 0,
            transactionCount: transactions.length,
            topCategories: {},
        };
        for (const tx of transactions) {
            if (tx.type === transaction_schema_1.TransactionType.SALARY || tx.type === transaction_schema_1.TransactionType.PRIME || tx.type === transaction_schema_1.TransactionType.BONUS || tx.type === transaction_schema_1.TransactionType.DEPOSIT || tx.type === transaction_schema_1.TransactionType.REFUND) {
                summary.totalIncome += tx.montant;
            }
            else {
                summary.totalExpenses += Math.abs(tx.montant);
            }
            const category = tx.category || 'OTHER';
            summary.topCategories[category] = (summary.topCategories[category] || 0) + Math.abs(tx.montant);
        }
        summary.netBalance = summary.totalIncome - summary.totalExpenses;
        return summary;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(1, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(2, (0, mongoose_1.InjectModel)(card_schema_1.Card.name)),
    __param(3, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(4, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection,
        event_emitter_1.EventEmitter2])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map
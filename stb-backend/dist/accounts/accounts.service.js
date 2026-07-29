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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const account_schema_1 = require("./schemas/account.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const crypto_1 = require("crypto");
const date_util_1 = require("../common/utils/date.util");
const number_util_1 = require("../common/utils/number.util");
const banking_constants_1 = require("../common/constants/banking.constants");
const event_emitter_1 = require("@nestjs/event-emitter");
const events_constants_1 = require("../common/constants/events.constants");
let AccountsService = class AccountsService {
    accountModel;
    transactionModel;
    eventEmitter;
    constructor(accountModel, transactionModel, eventEmitter) {
        this.accountModel = accountModel;
        this.transactionModel = transactionModel;
        this.eventEmitter = eventEmitter;
    }
    async createForEmployee(employeeId, type = account_schema_1.AccountType.COURANT, initialBalance = 0) {
        const num = (0, crypto_1.randomInt)(10000000, 99999999);
        const rib = `10${num}`;
        const iban = `TN59 10 0000 0${num} 00`;
        const numCompte = `001${num}`;
        const account = await this.accountModel.create({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            rib, iban, numCompte,
            type,
            status: account_schema_1.AccountStatus.ACTIVE,
            solde: initialBalance,
            currency: banking_constants_1.BANKING_CONSTANTS.DEFAULT_CURRENCY,
            isPrimary: type === account_schema_1.AccountType.COURANT,
            dailyWithdrawalLimit: banking_constants_1.BANKING_CONSTANTS.DAILY_WITHDRAWAL_LIMIT,
            dailyTransferLimit: banking_constants_1.BANKING_CONSTANTS.DAILY_TRANSFER_LIMIT,
            monthlyLimit: banking_constants_1.BANKING_CONSTANTS.MONTHLY_TRANSFER_LIMIT,
            lastWithdrawalReset: new Date(),
            lastMonthlyReset: new Date(),
        });
        this.eventEmitter.emit(events_constants_1.ACCOUNT_EVENTS.CREATED, { accountId: account._id, employeeId, type, initialBalance });
        return account;
    }
    async getMyAccounts(employeeId) {
        return this.accountModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
    }
    async findByEmployeeId(employeeId) {
        const accounts = await this.accountModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        return accounts.length > 0 ? accounts[0] : null;
    }
    async updateBalance(accountId, delta) {
        return this.accountModel.findByIdAndUpdate(accountId, { $inc: { solde: delta } }, { new: true }).exec();
    }
    async findOne(id) {
        const account = await this.accountModel.findById(id).exec();
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        return account;
    }
    async findByRIB(rib) {
        return this.accountModel.findOne({ rib }).exec();
    }
    async credit(accountId, montant, description, metadata) {
        const account = await this.findOne(accountId);
        if (account.status === account_schema_1.AccountStatus.FROZEN) {
            throw new common_1.ForbiddenException('Account is frozen');
        }
        const updated = await this.accountModel.findByIdAndUpdate(accountId, { $inc: { solde: montant } }, { new: true }).exec();
        const transaction = await this.transactionModel.create({
            employeeId: account.employeeId,
            montant,
            type: transaction_schema_1.TransactionType.DEPOSIT,
            description,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            accountId: new mongoose_2.Types.ObjectId(accountId),
            category: transaction_schema_1.TransactionCategory.INCOME,
            ...metadata,
        });
        this.eventEmitter.emit(events_constants_1.ACCOUNT_EVENTS.CREDITED, { accountId, montant, transactionId: transaction._id });
        return updated;
    }
    async debit(accountId, montant, description, metadata) {
        const account = await this.findOne(accountId);
        if (account.status === account_schema_1.AccountStatus.FROZEN) {
            throw new common_1.ForbiddenException('Account is frozen');
        }
        if (account.solde < montant) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        await this.enforceSpendingLimits(account, montant);
        const updated = await this.accountModel.findByIdAndUpdate(accountId, { $inc: { solde: -montant } }, { new: true }).exec();
        const transaction = await this.transactionModel.create({
            employeeId: account.employeeId,
            montant,
            type: transaction_schema_1.TransactionType.PAYMENT,
            description,
            status: transaction_schema_1.TransactionStatus.COMPLETED,
            accountId: new mongoose_2.Types.ObjectId(accountId),
            category: transaction_schema_1.TransactionCategory.OTHER,
            ...metadata,
        });
        this.eventEmitter.emit(events_constants_1.ACCOUNT_EVENTS.DEBITED, { accountId, montant, transactionId: transaction._id });
        return updated;
    }
    async enforceSpendingLimits(account, amount) {
        const now = new Date();
        const dailySpent = account.dailySpent || 0;
        const monthlySpent = account.monthlySpent || 0;
        if (dailySpent + amount > account.dailyWithdrawalLimit) {
            throw new common_1.BadRequestException(`Daily limit exceeded. Remaining: ${number_util_1.NumberUtil.formatCurrency(account.dailyWithdrawalLimit - dailySpent)}`);
        }
        if (monthlySpent + amount > account.monthlyLimit) {
            throw new common_1.BadRequestException(`Monthly limit exceeded. Remaining: ${number_util_1.NumberUtil.formatCurrency(account.monthlyLimit - monthlySpent)}`);
        }
    }
    async resetDailyLimits() {
        await this.accountModel.updateMany({ lastWithdrawalReset: { $lt: date_util_1.DateUtil.addDays(new Date(), -1) } }, { dailySpent: 0, lastWithdrawalReset: new Date() });
    }
    async resetMonthlyLimits() {
        await this.accountModel.updateMany({ lastMonthlyReset: { $lt: date_util_1.DateUtil.addMonths(new Date(), -1) } }, { monthlySpent: 0, lastMonthlyReset: new Date() });
    }
    async freeze(id, reason) {
        const account = await this.findOne(id);
        return this.accountModel.findByIdAndUpdate(id, { status: account_schema_1.AccountStatus.FROZEN, metadata: { ...account.metadata, freezeReason: reason } }, { new: true }).exec();
    }
    async unfreeze(id) {
        return this.accountModel.findByIdAndUpdate(id, { status: account_schema_1.AccountStatus.ACTIVE, 'metadata.freezeReason': null }, { new: true }).exec();
    }
    async close(id) {
        const account = await this.findOne(id);
        if (account.solde > 0) {
            throw new common_1.BadRequestException('Cannot close account with positive balance');
        }
        return this.accountModel.findByIdAndUpdate(id, { status: account_schema_1.AccountStatus.CLOSED }, { new: true }).exec();
    }
    async getAllAccounts() {
        return this.accountModel.find().populate('employeeId', 'nom prenom matricule').exec();
    }
    async getAccountStats() {
        const [total, active, frozen, closed] = await Promise.all([
            this.accountModel.countDocuments(),
            this.accountModel.countDocuments({ status: account_schema_1.AccountStatus.ACTIVE }),
            this.accountModel.countDocuments({ status: account_schema_1.AccountStatus.FROZEN }),
            this.accountModel.countDocuments({ status: account_schema_1.AccountStatus.CLOSED }),
        ]);
        const totalBalance = await this.accountModel.aggregate([
            { $group: { _id: null, total: { $sum: '$solde' } } },
        ]).exec();
        return {
            total,
            active,
            frozen,
            closed,
            totalBalance: totalBalance[0]?.total || 0,
        };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map
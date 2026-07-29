import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountType, AccountStatus } from './schemas/account.schema';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../transactions/schemas/transaction.schema';
import { randomInt } from 'crypto';
import { DateUtil } from '../common/utils/date.util';
import { NumberUtil } from '../common/utils/number.util';
import { BANKING_CONSTANTS } from '../common/constants/banking.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACCOUNT_EVENTS } from '../common/constants/events.constants';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createForEmployee(employeeId: string, type: AccountType = AccountType.COURANT, initialBalance: number = 0): Promise<Account> {
    const num = randomInt(10000000, 99999999);
    const rib = `10${num}`;
    const iban = `TN59 10 0000 0${num} 00`;
    const numCompte = `001${num}`;

    const account = await this.accountModel.create({
      employeeId: new Types.ObjectId(employeeId),
      rib, iban, numCompte,
      type,
      status: AccountStatus.ACTIVE,
      solde: initialBalance,
      currency: BANKING_CONSTANTS.DEFAULT_CURRENCY,
      isPrimary: type === AccountType.COURANT,
      dailyWithdrawalLimit: BANKING_CONSTANTS.DAILY_WITHDRAWAL_LIMIT,
      dailyTransferLimit: BANKING_CONSTANTS.DAILY_TRANSFER_LIMIT,
      monthlyLimit: BANKING_CONSTANTS.MONTHLY_TRANSFER_LIMIT,
      lastWithdrawalReset: new Date(),
      lastMonthlyReset: new Date(),
    });

    this.eventEmitter.emit(ACCOUNT_EVENTS.CREATED, { accountId: account._id, employeeId, type, initialBalance });
    return account;
  }

  async getMyAccounts(employeeId: string) {
    return this.accountModel.find({ employeeId: new Types.ObjectId(employeeId) }).exec();
  }

  async findByEmployeeId(employeeId: string) {
    const accounts = await this.accountModel.find({ employeeId: new Types.ObjectId(employeeId) }).exec();
    return accounts.length > 0 ? accounts[0] : null; // Return primary account
  }

  async updateBalance(accountId: string, delta: number) {
    return this.accountModel.findByIdAndUpdate(
      accountId,
      { $inc: { solde: delta } },
      { new: true },
    ).exec();
  }

  async findOne(id: string) {
    const account = await this.accountModel.findById(id).exec();
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async findByRIB(rib: string) {
    return this.accountModel.findOne({ rib }).exec();
  }

  async credit(accountId: string, montant: number, description: string, metadata?: any) {
    const account = await this.findOne(accountId);
    if (account.status === AccountStatus.FROZEN) {
      throw new ForbiddenException('Account is frozen');
    }

    const updated = await this.accountModel.findByIdAndUpdate(
      accountId,
      { $inc: { solde: montant } },
      { new: true },
    ).exec();

    const transaction = await this.transactionModel.create({
      employeeId: account.employeeId,
      montant,
      type: TransactionType.DEPOSIT,
      description,
      status: TransactionStatus.COMPLETED,
      accountId: new Types.ObjectId(accountId),
      category: TransactionCategory.INCOME,
      ...metadata,
    });

    this.eventEmitter.emit(ACCOUNT_EVENTS.CREDITED, { accountId, montant, transactionId: transaction._id });
    return updated;
  }

  async debit(accountId: string, montant: number, description: string, metadata?: any) {
    const account = await this.findOne(accountId);
    if (account.status === AccountStatus.FROZEN) {
      throw new ForbiddenException('Account is frozen');
    }

    if (account.solde < montant) {
      throw new BadRequestException('Insufficient balance');
    }

    await this.enforceSpendingLimits(account, montant);

    const updated = await this.accountModel.findByIdAndUpdate(
      accountId,
      { $inc: { solde: -montant } },
      { new: true },
    ).exec();

    const transaction = await this.transactionModel.create({
      employeeId: account.employeeId,
      montant,
      type: TransactionType.PAYMENT,
      description,
      status: TransactionStatus.COMPLETED,
      accountId: new Types.ObjectId(accountId),
      category: TransactionCategory.OTHER,
      ...metadata,
    });

    this.eventEmitter.emit(ACCOUNT_EVENTS.DEBITED, { accountId, montant, transactionId: transaction._id });
    return updated;
  }

  private async enforceSpendingLimits(account: Account, amount: number) {
    const now = new Date();
    const dailySpent = account.dailySpent || 0;
    const monthlySpent = account.monthlySpent || 0;

    if (dailySpent + amount > account.dailyWithdrawalLimit) {
      throw new BadRequestException(`Daily limit exceeded. Remaining: ${NumberUtil.formatCurrency(account.dailyWithdrawalLimit - dailySpent)}`);
    }

    if (monthlySpent + amount > account.monthlyLimit) {
      throw new BadRequestException(`Monthly limit exceeded. Remaining: ${NumberUtil.formatCurrency(account.monthlyLimit - monthlySpent)}`);
    }
  }

  async resetDailyLimits() {
    await this.accountModel.updateMany(
      { lastWithdrawalReset: { $lt: DateUtil.addDays(new Date(), -1) } },
      { dailySpent: 0, lastWithdrawalReset: new Date() },
    );
  }

  async resetMonthlyLimits() {
    await this.accountModel.updateMany(
      { lastMonthlyReset: { $lt: DateUtil.addMonths(new Date(), -1) } },
      { monthlySpent: 0, lastMonthlyReset: new Date() },
    );
  }

  async freeze(id: string, reason?: string) {
    const account = await this.findOne(id);
    return this.accountModel.findByIdAndUpdate(id, { status: AccountStatus.FROZEN, metadata: { ...account.metadata, freezeReason: reason } }, { new: true }).exec();
  }

  async unfreeze(id: string) {
    return this.accountModel.findByIdAndUpdate(id, { status: AccountStatus.ACTIVE, 'metadata.freezeReason': null }, { new: true }).exec();
  }

  async close(id: string) {
    const account = await this.findOne(id);
    if (account.solde > 0) {
      throw new BadRequestException('Cannot close account with positive balance');
    }
    return this.accountModel.findByIdAndUpdate(id, { status: AccountStatus.CLOSED }, { new: true }).exec();
  }

  async getAllAccounts() {
    return this.accountModel.find().populate('employeeId', 'nom prenom matricule').exec();
  }

  async getAccountStats() {
    const [total, active, frozen, closed] = await Promise.all([
      this.accountModel.countDocuments(),
      this.accountModel.countDocuments({ status: AccountStatus.ACTIVE }),
      this.accountModel.countDocuments({ status: AccountStatus.FROZEN }),
      this.accountModel.countDocuments({ status: AccountStatus.CLOSED }),
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
}

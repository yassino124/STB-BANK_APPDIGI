import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from './schemas/transaction.schema';
import { Account, AccountStatus } from '../accounts/schemas/account.schema';
import { Card } from '../cards/schemas/card.schema';
import { Employee } from '../employees/employee.schema';
import { NumberUtil } from '../common/utils/number.util';
import { StringUtil } from '../common/utils/string.util';
import { DateUtil } from '../common/utils/date.util';
import { BANKING_CONSTANTS } from '../common/constants/banking.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TRANSACTION_EVENTS } from '../common/constants/events.constants';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectConnection() private connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {}

  async getMyTransactions(employeeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const objectId = new Types.ObjectId(employeeId);
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

    // Map the 'sens' (direction) for the frontend
    const data = docs.map(doc => {
      const isReceiver = doc.to && doc.to._id.toString() === employeeId;
      const isIncomeCategory = doc.category === TransactionCategory.INCOME || doc.category === TransactionCategory.SALARY;
      const isCredit = isReceiver || isIncomeCategory;
      
      return {
        ...doc.toObject(),
        sens: isCredit ? 'CREDIT' : 'DEBIT',
      };
    });

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getEmployeeTransactions(employeeId: string) {
    return this.transactionModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('from', 'nom prenom matricule')
      .populate('to', 'nom prenom matricule')
      .sort({ date: -1 })
      .exec();
  }

  async createTransfer(fromEmployeeId: string, toMatricule: string, montant: number, description: string, metadata?: any) {
    if (montant <= 0) throw new BadRequestException('Invalid amount');
    if (montant > BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT) {
      throw new BadRequestException(`Maximum transfer amount is ${NumberUtil.formatCurrency(BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT)}`);
    }

    try {
      // ── 1. Validation des comptes ─────────────────────────────────────────
      const fromAccount = await this.accountModel.findOne({ employeeId: new Types.ObjectId(fromEmployeeId), isPrimary: true }).exec()
        || await this.accountModel.findOne({ employeeId: new Types.ObjectId(fromEmployeeId) }).exec();

      if (!fromAccount) throw new NotFoundException('Source account not found');
      if (fromAccount.status === AccountStatus.FROZEN) throw new ForbiddenException('Source account is frozen');

      const toEmployee = await this.employeeModel.findOne({ matricule: toMatricule.toUpperCase() }).exec();
      if (!toEmployee) throw new NotFoundException('Destination employee not found');

      const toAccount = await this.accountModel.findOne({ employeeId: toEmployee._id, isPrimary: true }).exec()
        || await this.accountModel.findOne({ employeeId: toEmployee._id }).exec();

      if (!toAccount) throw new NotFoundException('Destination account not found');
      if (toAccount.status === AccountStatus.FROZEN) throw new ForbiddenException('Destination account is frozen');
      if (fromAccount._id.toString() === toAccount._id.toString()) throw new BadRequestException('Cannot transfer to same account');

      const fee = montant > 10000 ? montant * 0.005 : 0;
      const totalDebit = montant + fee;

      // ── 2. Débit atomique avec vérification du solde dans le filtre ──────
      // 🛡️ Correction Race Condition : findOneAndUpdate avec $gte dans le filtre
      // Si deux requêtes arrivent simultanément, une seule trouvera le document
      // avec solde >= totalDebit. L'autre recevra null → BadRequestException.
      const debitedAccount = await this.accountModel.findOneAndUpdate(
        { _id: fromAccount._id, solde: { $gte: totalDebit }, status: { $ne: AccountStatus.FROZEN } },
        { $inc: { solde: -totalDebit } },
        { new: true },
      ).exec();

      if (!debitedAccount) {
        throw new BadRequestException('Insufficient balance or account unavailable (concurrent request blocked)');
      }

      // ── 3. Crédit du compte destinataire ─────────────────────────────────
      await this.accountModel.findByIdAndUpdate(toAccount._id, { $inc: { solde: montant } }).exec();

      // ── 4. Mise à jour compteSolde employé ───────────────────────────────
      await this.employeeModel.findByIdAndUpdate(fromAccount.employeeId, { $inc: { compteSolde: -totalDebit } }).exec();
      await this.employeeModel.findByIdAndUpdate(toAccount.employeeId, { $inc: { compteSolde: montant } }).exec();

      // ── 5. Enregistrement de la transaction ──────────────────────────────
      const reference = StringUtil.generateReference('TRF');
      const transaction = await this.transactionModel.create({
        employeeId: fromAccount.employeeId,
        montant,
        type: TransactionType.TRANSFER,
        description: description || 'Transfer',
        status: TransactionStatus.COMPLETED,
        from: fromAccount.employeeId,
        to: toAccount.employeeId,
        accountId: fromAccount._id,
        toAccountId: toAccount._id,
        reference,
        fee,
        category: TransactionCategory.TRANSFER,
        ...metadata,
      });

      this.eventEmitter.emit(TRANSACTION_EVENTS.TRANSFER_COMPLETED, {
        transactionId: transaction._id,
        fromAccountId: fromAccount._id,
        toAccountId: toAccount._id,
        montant,
        fee,
      });

      this.detectFraud(transaction._id.toString()).catch(err => console.error('Fraud detection error:', err));
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  // Transfer by employee IDs directly (for mobile app)
  async createTransferById(fromEmployeeId: string, toEmployeeId: string, amount: number, description: string, metadata?: any) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    if (amount > BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT) {
      throw new BadRequestException(`Maximum transfer amount is ${NumberUtil.formatCurrency(BANKING_CONSTANTS.MAX_TRANSFER_AMOUNT)}`);
    }

    try {
      // ── 1. Validation des comptes ─────────────────────────────────────────
      const fromAccount = await this.accountModel.findOne({ employeeId: new Types.ObjectId(fromEmployeeId), isPrimary: true }).exec()
        || await this.accountModel.findOne({ employeeId: new Types.ObjectId(fromEmployeeId) }).exec();

      if (!fromAccount) throw new NotFoundException('Source account not found');
      if (fromAccount.status === AccountStatus.FROZEN) throw new ForbiddenException('Source account is frozen');

      const toAccount = await this.accountModel.findOne({ employeeId: new Types.ObjectId(toEmployeeId), isPrimary: true }).exec()
        || await this.accountModel.findOne({ employeeId: new Types.ObjectId(toEmployeeId) }).exec();

      if (!toAccount) throw new NotFoundException('Destination account not found');
      if (toAccount.status === AccountStatus.FROZEN) throw new ForbiddenException('Destination account is frozen');
      if (fromAccount._id.toString() === toAccount._id.toString()) throw new BadRequestException('Cannot transfer to same account');

      const fee = amount > 10000 ? amount * 0.005 : 0;
      const totalDebit = amount + fee;

      // ── 2. Débit atomique avec vérification du solde dans le filtre ──────
      // 🛡️ Correction Race Condition : findOneAndUpdate avec $gte dans le filtre
      // Garantit qu'une seule transaction peut débiter si deux arrivent en même temps.
      const debitedAccount = await this.accountModel.findOneAndUpdate(
        { _id: fromAccount._id, solde: { $gte: totalDebit }, status: { $ne: AccountStatus.FROZEN } },
        { $inc: { solde: -totalDebit } },
        { new: true },
      ).exec();

      if (!debitedAccount) {
        throw new BadRequestException('Insufficient balance or account unavailable (concurrent request blocked)');
      }

      // ── 3. Crédit du compte destinataire ─────────────────────────────────
      await this.accountModel.findByIdAndUpdate(toAccount._id, { $inc: { solde: amount } }).exec();

      // ── 4. Mise à jour compteSolde employé ───────────────────────────────
      await this.employeeModel.findByIdAndUpdate(fromAccount.employeeId, { $inc: { compteSolde: -totalDebit } }).exec();
      await this.employeeModel.findByIdAndUpdate(toAccount.employeeId, { $inc: { compteSolde: amount } }).exec();

      // ── 5. Enregistrement de la transaction ──────────────────────────────
      const reference = StringUtil.generateReference('TRF');
      const transaction = await this.transactionModel.create({
        employeeId: fromAccount.employeeId,
        montant: amount,
        type: TransactionType.TRANSFER,
        description: description || 'Transfer',
        status: TransactionStatus.COMPLETED,
        from: fromAccount.employeeId,
        to: toAccount.employeeId,
        accountId: fromAccount._id,
        toAccountId: toAccount._id,
        reference,
        fee,
        category: TransactionCategory.TRANSFER,
        ...metadata,
      });

      this.eventEmitter.emit(TRANSACTION_EVENTS.TRANSFER_COMPLETED, {
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
    } catch (error) {
      throw error;
    }
  }

  async createTransaction(data: Partial<Transaction>) {
    const reference = data.reference || StringUtil.generateReference('TXN');
    const transaction = await this.transactionModel.create({ ...data, reference });
    return transaction;
  }

  async findOne(id: string) {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async findByReference(reference: string) {
    return this.transactionModel.findOne({ reference }).exec();
  }

  async getTransactionStats(employeeId: string, startDate?: Date, endDate?: Date) {
    const match: any = { employeeId: new Types.ObjectId(employeeId) };
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

  async getMonthlySummary(employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.transactionModel.find({
      employeeId: new Types.ObjectId(employeeId),
      date: { $gte: startDate, $lte: endDate },
    }).exec();

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalTransfers: 0,
      transactionCount: transactions.length,
      byCategory: {} as Record<string, number>,
    };

    for (const tx of transactions) {
      if (tx.montant > 0) {
        summary.totalIncome += tx.montant;
      } else {
        summary.totalExpenses += Math.abs(tx.montant);
      }

      summary.byCategory[tx.category] = (summary.byCategory[tx.category] || 0) + tx.montant;
    }

    return summary;
  }

  async detectFraud(transactionId: string) {
    const transaction = await this.transactionModel.findById(transactionId).exec();
    if (!transaction) throw new NotFoundException('Transaction not found');

    let riskScore = 0;
    const factors: string[] = [];

    if (transaction.montant > 50000) {
      riskScore += 30;
      factors.push('HIGH_AMOUNT');
    }

    if (transaction.location && transaction.location !== 'TN') {
      riskScore += 20;
      factors.push('FOREIGN_TRANSACTION');
    }

    const recentTransactions = await this.transactionModel
      .find({ employeeId: transaction.employeeId, date: { $gte: DateUtil.addDays(new Date(), -1) } })
      .countDocuments();

    if (recentTransactions > 10) {
      riskScore += 25;
      factors.push('MULTIPLE_TRANSACTIONS');
    }

    await this.transactionModel.findByIdAndUpdate(transactionId, {
      fraudScore: Math.min(riskScore, 100),
      riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
    }).exec();

    if (riskScore >= BANKING_CONSTANTS.FRAUD_SCORE_THRESHOLD) {
      this.eventEmitter.emit(TRANSACTION_EVENTS.FRAUD_DETECTED, {
        transactionId,
        employeeId: transaction.employeeId,
        riskScore,
        factors,
      });
    }

    return { riskScore, factors, level: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW' };
  }

  // ── Analytics for Dashboard ──────────────────────────────────────
  async getMonthlyAnalytics(employeeId: string) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const transactions = await this.transactionModel.find({
      employeeId: new Types.ObjectId(employeeId),
      date: { $gte: startOfYear },
      status: TransactionStatus.COMPLETED,
    }).exec();

    // Group by month and category
    const monthlyData: Record<string, { income: number; expenses: number; byCategory: Record<string, number> }> = {};
    
    for (const tx of transactions) {
      const monthKey = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, byCategory: {} };
      }
      
      // Income vs Expenses
      if (tx.type === TransactionType.SALARY || tx.type === TransactionType.PRIME || tx.type === TransactionType.BONUS || tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFUND) {
        monthlyData[monthKey].income += tx.montant;
      } else {
        monthlyData[monthKey].expenses += Math.abs(tx.montant);
      }
      
      // By category
      const category = tx.category || 'OTHER';
      monthlyData[monthKey].byCategory[category] = (monthlyData[monthKey].byCategory[category] || 0) + Math.abs(tx.montant);
    }

    return monthlyData;
  }

  async getSummary(employeeId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const transactions = await this.transactionModel.find({
      employeeId: new Types.ObjectId(employeeId),
      date: { $gte: startOfMonth },
      status: TransactionStatus.COMPLETED,
    }).exec();

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: transactions.length,
      topCategories: {} as Record<string, number>,
    };

    for (const tx of transactions) {
      if (tx.type === TransactionType.SALARY || tx.type === TransactionType.PRIME || tx.type === TransactionType.BONUS || tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFUND) {
        summary.totalIncome += tx.montant;
      } else {
        summary.totalExpenses += Math.abs(tx.montant);
      }
      
      const category = tx.category || 'OTHER';
      summary.topCategories[category] = (summary.topCategories[category] || 0) + Math.abs(tx.montant);
    }

    summary.netBalance = summary.totalIncome - summary.totalExpenses;

    return summary;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee } from '../employees/employee.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import { Account } from '../accounts/schemas/account.schema';
import { Card } from '../cards/schemas/card.schema';
import { Credit, CreditStatus } from '../credits/schemas/credit.schema';
import { LeaveBalance } from '../leave/schemas/leave.schema';
import { Prime, PrimeStatus } from '../primes/schemas/prime.schema';
import { Payroll } from '../payroll/schemas/payroll.schema';
import { Notification } from '../notifications/schemas/notification.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Employee.name) private empModel: Model<Employee>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(Credit.name) private creditModel: Model<Credit>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(Prime.name) private primeModel: Model<Prime>,
    @InjectModel(Payroll.name) private payrollModel: Model<Payroll>,
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
    @InjectModel(Transaction.name) private txModel: Model<Transaction>,
  ) {}

  async getEmployeeDashboard(employeeId: string) {
    const eid = new Types.ObjectId(employeeId);
    const [employee, accounts, cards, credits, leaveBalance, primes, lastPayroll, unreadNotifs, recentTx] = await Promise.all([
      this.empModel.findById(eid, { passwordHash: 0, pinHash: 0 }).exec(),
      this.accountModel.find({ employeeId: eid }).exec(),
      this.cardModel.find({ employeeId: eid }, { cvvHash: 0, pinHash: 0 }).exec(),
      this.creditModel.find({ employeeId: eid, status: CreditStatus.ACTIVE }).exec(),
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
      this.empModel.countDocuments({ status: EmployeeStatus.ACTIVE }).exec(),
      this.leaveBalanceModel.countDocuments().exec(), // approximate
      this.primeModel.countDocuments({ status: PrimeStatus.PENDING }).exec(),
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
}

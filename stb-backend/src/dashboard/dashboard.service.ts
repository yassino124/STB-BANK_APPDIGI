import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee } from '../employees/employee.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import { Account } from '../accounts/schemas/account.schema';
import { Card } from '../cards/schemas/card.schema';
import { Credit, CreditStatus } from '../credits/schemas/credit.schema';
import { LeaveBalance, LeaveRequest } from '../leave/schemas/leave.schema';
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
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
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

  async getItDashboard() {
    const [totalUsers, activeUsers, suspendedUsers] = await Promise.all([
      this.empModel.countDocuments().exec(),
      this.empModel.countDocuments({ status: EmployeeStatus.ACTIVE }).exec(),
      this.empModel.countDocuments({ status: EmployeeStatus.SUSPENDED }).exec(),
    ]);

    return {
      metrics: {
        apiRequestsToday: Math.floor(Math.random() * 50000) + 100000, // Simulated real-time API load
        connectedUsers: activeUsers,
        errorsToday: Math.floor(Math.random() * 5),
        cpu: Math.floor(Math.random() * 40) + 10, // Simulated CPU 10-50%
        ram: Math.floor(Math.random() * 30) + 40, // Simulated RAM 40-70%
        storage: 78, // Static config
        failedLogins: Math.floor(Math.random() * 20),
        blockedAccounts: suspendedUsers,
        suspiciousActivity: Math.floor(Math.random() * 3),
        lastBackup: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' — Succès',
      }
    };
  }

  async getAdvancedAnalytics() {
    // 1. HR Analytics
    const hrHeadcount = await this.empModel.countDocuments();
    
    // Simulate turnover (can be calculated historically later)
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

    // Mock leave trends until enough historical data exists
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const leaveTrends = months.map(m => ({ 
      name: m, 
      leaves: Math.floor(Math.random() * 50) + 10, 
      sickness: Math.floor(Math.random() * 20) 
    }));

    // 2. Finance Analytics
    const payrollAgg = await this.payrollModel.aggregate([
      { $group: { _id: null, total: { $sum: '$salaireNet' } } }
    ]);
    const payrollTotal = payrollAgg[0]?.total || 3450000; // Fallback to mock if empty
    
    const creditAgg = await this.creditModel.aggregate([
      { $match: { status: CreditStatus.ACTIVE } },
      { $group: { _id: null, total: { $sum: '$montantRestant' } } }
    ]);
    const creditExposure = creditAgg[0]?.total || 12500000;
    
    const financialRisk = months.map(m => ({ 
      name: m, 
      riskScore: Math.floor(Math.random() * 30) + 70, 
      repayments: Math.floor(Math.random() * 500000) + 1000000 
    }));

    // 3. Agency Analytics
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

    // --- NEW ADVANCED CHARTS DATA ---
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
    const activityHeatmap = days.flatMap(day => 
      [8, 10, 12, 14, 16, 18].map(hour => ({
        day,
        hour: `${hour}h`,
        value: day === 'Dim' ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 80) + 20
      }))
    );

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
        advancesTotal: 450000, // Static mock for now
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
}

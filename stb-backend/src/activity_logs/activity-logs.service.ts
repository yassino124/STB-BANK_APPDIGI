import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { Payroll } from '../payroll/schemas/payroll.schema';
import { LeaveRequest } from '../leave/schemas/leave.schema';
import { Credit } from '../credits/schemas/credit.schema';
import { Notification } from '../notifications/schemas/notification.schema';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<any>,
    @InjectModel(Payroll.name) private payrollModel: Model<any>,
    @InjectModel(LeaveRequest.name) private leaveModel: Model<any>,
    @InjectModel(Credit.name) private creditModel: Model<any>,
    @InjectModel(Notification.name) private notificationModel: Model<any>,
  ) {}

  async create(data: Partial<ActivityLog>) {
    return this.activityLogModel.create(data);
  }

  async findByEmployee(employeeId: string, limit = 100) {
    return this.activityLogModel.find({ employeeId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findByModule(module: string, limit = 100) {
    return this.activityLogModel.find({ module }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findRecent(limit = 100) {
    return this.activityLogModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async getMyActivityTimeline(employeeId: string, limit = 20) {
    const objectId = new Types.ObjectId(employeeId);
    
    // Fetch parallel with populate for employee names
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

    const timeline: any[] = [];

    // Map Transactions with sender/receiver info
    transactions.forEach(t => {
      const isCredit = t.to?._id?.toString() === employeeId || t.to?.toString() === employeeId;
      const sign = isCredit ? '+' : '-';
      let title = isCredit ? 'Virement reçu' : (t.type === 'TRANSFER' ? 'Virement envoyé' : 'Transaction');
      if (t.category === 'SALARY_ADVANCE') title = 'Avance sur salaire';
      
      // Extract sender/receiver names
      let fromName = '';
      let toName = '';
      
      if (t.from) {
        if (typeof t.from === 'object' && t.from.prenom) {
          fromName = `${t.from.prenom} ${t.from.nom}`.trim();
        } else {
          fromName = 'Compte STB';
        }
      }
      
      if (t.to) {
        if (typeof t.to === 'object' && t.to.prenom) {
          toName = `${t.to.prenom} ${t.to.nom}`.trim();
        } else {
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

    // Map Payrolls
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

    // Map Leaves
    leaves.forEach(l => {
      let title = 'Demande de congé';
      if (l.status === 'APPROVED') title = 'Congé accepté';
      else if (l.status === 'REJECTED') title = 'Congé refusé';
      
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

    // Map Credits
    credits.forEach(c => {
      let title = 'Demande de crédit';
      if (c.status === 'APPROVED') title = 'Crédit approuvé';
      else if (c.status === 'REJECTED') title = 'Crédit refusé';
      else if (c.status === 'ACTIVE') title = 'Crédit actif';
      
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

    // Map Notifications (that are not purely financial to avoid duplicates if needed, but for now we include them)
    notifications.forEach(n => {
      // Avoid duplicate display for things we already cover with specific collections
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

    // Sort by date DESC
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return top N
    return timeline.slice(0, limit);
  }
}

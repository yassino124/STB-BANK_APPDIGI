import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiskAlert, RiskAlertDocument, AlertStatus, AlertSeverity } from './schemas/risk-alert.schema';

@Injectable()
export class RiskAlertsService {
  constructor(
    @InjectModel(RiskAlert.name)
    private riskAlertModel: Model<RiskAlertDocument>,
  ) {}

  async create(data: Partial<RiskAlert>) {
    return this.riskAlertModel.create(data);
  }

  /** Toutes les alertes avec infos employé (pour dashboard) */
  async findAll(limit = 50) {
    return this.riskAlertModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('employeeId', 'nom prenom matricule roles departement')
      .exec();
  }

  async findByEmployee(employeeId: string) {
    return this.riskAlertModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .populate('employeeId', 'nom prenom matricule')
      .exec();
  }

  async findOpen() {
    return this.riskAlertModel
      .find({ status: 'OPEN' as any })
      .sort({ severity: -1, createdAt: -1 })
      .populate('employeeId', 'nom prenom matricule')
      .exec();
  }

  /** Stats globales pour les dashboards */
  async getSummary() {
    const [total, open, critical, resolved] = await Promise.all([
      this.riskAlertModel.countDocuments(),
      this.riskAlertModel.countDocuments({ status: AlertStatus.OPEN }),
      this.riskAlertModel.countDocuments({ severity: AlertSeverity.CRITICAL }),
      this.riskAlertModel.countDocuments({ status: AlertStatus.RESOLVED }),
    ]);

    return {
      total,
      open,
      critical,
      resolved,
      active: open,
    };
  }

  /** Statistiques mensuelles pour graphiques Direction */
  async getMonthlyStats(months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const result = await this.riskAlertModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return result.map((r) => ({
      month: monthNames[r._id.month - 1],
      year: r._id.year,
      total: r.total,
      critical: r.critical,
      resolved: r.resolved,
    }));
  }

  async findOne(id: string) {
    const alert = await this.riskAlertModel
      .findById(id)
      .populate('employeeId', 'nom prenom matricule roles')
      .exec();
    if (!alert) throw new NotFoundException('Risk alert not found');
    return alert;
  }

  async updateStatus(id: string, status: string, resolvedBy?: string) {
    const update: any = { status };
    if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
      update.resolvedAt = new Date();
      if (resolvedBy) update.resolvedBy = resolvedBy;
    }
    const alert = await this.riskAlertModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!alert) throw new NotFoundException('Risk alert not found');
    return alert;
  }
}

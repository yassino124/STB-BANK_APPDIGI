import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FraudDetection, FraudDetectionDocument, FraudStatus } from './schemas/fraud-detection.schema';

@Injectable()
export class FraudDetectionsService {
  constructor(
    @InjectModel(FraudDetection.name)
    private fraudDetectionModel: Model<FraudDetectionDocument>,
  ) {}

  async create(data: Partial<FraudDetection>) {
    return this.fraudDetectionModel.create(data);
  }

  /** Toutes les détections avec infos employé (pour dashboard) */
  async findAll(limit = 50) {
    return this.fraudDetectionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('employeeId', 'nom prenom matricule roles departement')
      .exec();
  }

  async findByEmployee(employeeId: string) {
    return this.fraudDetectionModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .populate('employeeId', 'nom prenom matricule')
      .exec();
  }

  async findHighRisk(threshold = 70) {
    return this.fraudDetectionModel
      .find({ riskScore: { $gte: threshold } })
      .sort({ riskScore: -1 })
      .populate('employeeId', 'nom prenom matricule')
      .exec();
  }

  /** Stats globales pour les dashboards */
  async getSummary() {
    const [total, highRisk, investigating, confirmed, dismissed] = await Promise.all([
      this.fraudDetectionModel.countDocuments(),
      this.fraudDetectionModel.countDocuments({ riskScore: { $gte: 70 } }),
      this.fraudDetectionModel.countDocuments({ status: FraudStatus.INVESTIGATING }),
      this.fraudDetectionModel.countDocuments({ status: FraudStatus.CONFIRMED }),
      this.fraudDetectionModel.countDocuments({ status: FraudStatus.DISMISSED }),
    ]);

    // Score moyen
    const avgScoreResult = await this.fraudDetectionModel.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$riskScore' } } },
    ]);
    const avgScore = avgScoreResult[0]?.avgScore ?? 0;

    return {
      total,
      highRisk,
      investigating,
      confirmed,
      dismissed,
      avgScore: Math.round(avgScore),
      pending: total - confirmed - dismissed,
    };
  }

  /** Statistiques mensuelles pour graphiques Direction */
  async getMonthlyStats(months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const result = await this.fraudDetectionModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] } },
          highRisk: { $sum: { $cond: [{ $gte: ['$riskScore', 70] }, 1, 0] } },
          avgScore: { $avg: '$riskScore' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return result.map((r) => ({
      month: monthNames[r._id.month - 1],
      year: r._id.year,
      total: r.total,
      confirmed: r.confirmed,
      highRisk: r.highRisk,
      avgScore: Math.round(r.avgScore),
    }));
  }

  /** Stats par type de fraude */
  async getByType() {
    return this.fraudDetectionModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgScore: { $avg: '$riskScore' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async findOne(id: string) {
    const detection = await this.fraudDetectionModel
      .findById(id)
      .populate('employeeId', 'nom prenom matricule roles')
      .exec();
    if (!detection) throw new NotFoundException('Fraud detection not found');
    return detection;
  }

  async updateStatus(id: string, status: string, assignedTo?: string) {
    const update: any = { status };
    if (assignedTo) update.assignedTo = assignedTo;
    const detection = await this.fraudDetectionModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!detection) throw new NotFoundException('Fraud detection not found');
    return detection;
  }
}

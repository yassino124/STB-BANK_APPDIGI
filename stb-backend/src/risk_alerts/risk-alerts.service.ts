import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiskAlert, RiskAlertDocument } from './schemas/risk-alert.schema';

@Injectable()
export class RiskAlertsService {
  constructor(@InjectModel(RiskAlert.name) private riskAlertModel: Model<RiskAlertDocument>) {}

  async create(data: Partial<RiskAlert>) {
    return this.riskAlertModel.create(data);
  }

  async findByEmployee(employeeId: string) {
    return this.riskAlertModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
  }

  async findOpen() {
    return this.riskAlertModel.find({ status: 'OPEN' as any }).sort({ severity: -1, createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const alert = await this.riskAlertModel.findById(id).exec();
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

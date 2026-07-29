import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument, ReportStatus } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {}

  async create(data: Partial<Report>) {
    return this.reportModel.create(data);
  }

  async findAll() {
    return this.reportModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const report = await this.reportModel.findById(id).exec();
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async updateStatus(id: string, status: string) {
    const report = await this.reportModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generateReport(reportId: string) {
    const report = await this.reportModel.findById(reportId).exec();
    if (!report) throw new NotFoundException('Report not found');
    report.status = ReportStatus.COMPLETED;
    await report.save();
    return report;
  }
}

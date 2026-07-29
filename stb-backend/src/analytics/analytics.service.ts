import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>) {}

  async create(data: Partial<Analytics>) {
    return this.analyticsModel.create(data);
  }

  async findAll(period?: string, metric?: string) {
    const query: any = {};
    if (period) query.period = period;
    if (metric) query.metric = metric;
    return this.analyticsModel.find(query).sort({ startDate: -1 }).exec();
  }

  async findByEmployee(employeeId: string, metric?: string) {
    const query: any = { employeeId };
    if (metric) query.metric = metric;
    return this.analyticsModel.find(query).sort({ startDate: -1 }).exec();
  }

  async findAggregates(metric: string, startDate: Date, endDate: Date) {
    return this.analyticsModel.aggregate([
      { $match: { metric, startDate: { $gte: startDate }, endDate: { $lte: endDate } } },
      {
        $group: {
          _id: '$employeeId',
          total: { $sum: '$value' },
          avg: { $avg: '$value' },
          count: { $sum: 1 },
        },
      },
    ]).exec();
  }
}

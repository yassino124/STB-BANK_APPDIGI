import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment, InvestmentDocument } from './schemas/investment.schema';

@Injectable()
export class InvestmentsService {
  constructor(@InjectModel(Investment.name) private investmentModel: Model<InvestmentDocument>) {}

  async create(data: Partial<Investment>) {
    return this.investmentModel.create(data);
  }

  async findByEmployee(employeeId?: string) {
    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;
    const docs = await this.investmentModel.find(filter).sort({ createdAt: -1 }).exec();
    return docs.map((d: any) => ({
      _id: d._id,
      name: d.name,
      type: d.type,
      amount: d.initialAmount,
      returns: d.currentValue - d.initialAmount,
      roi: d.initialAmount > 0 ? ((d.currentValue - d.initialAmount) / d.initialAmount) * 100 : 0,
      status: d.status,
      startDate: d.startDate,
      riskLevel: d.riskLevel,
    }));
  }

  async findOne(id: string) {
    const investment = await this.investmentModel.findById(id).exec();
    if (!investment) throw new NotFoundException('Investment not found');
    return investment;
  }

  async update(id: string, data: Partial<Investment>) {
    const investment = await this.investmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!investment) throw new NotFoundException('Investment not found');
    return investment;
  }
}

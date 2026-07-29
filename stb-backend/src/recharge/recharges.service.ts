import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recharge, RechargeDocument } from './schemas/recharge.schema';

@Injectable()
export class RechargesService {
  constructor(@InjectModel(Recharge.name) private rechargeModel: Model<RechargeDocument>) {}

  async create(data: Partial<Recharge>) {
    return this.rechargeModel.create(data);
  }

  async findByEmployee(employeeId: string) {
    return this.rechargeModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const recharge = await this.rechargeModel.findById(id).exec();
    if (!recharge) throw new NotFoundException('Recharge not found');
    return recharge;
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Beneficiary, BeneficiaryDocument } from './schemas/beneficiary.schema';

@Injectable()
export class BeneficiariesService {
  constructor(@InjectModel(Beneficiary.name) private beneficiaryModel: Model<BeneficiaryDocument>) {}

  async create(employeeId: string, data: Partial<Beneficiary>) {
    const existing = await this.beneficiaryModel.findOne({
      employeeId,
      rib: data.rib,
    });
    if (existing) throw new ConflictException('Beneficiary with this RIB already exists');
    return this.beneficiaryModel.create({ ...data, employeeId });
  }

  async findByEmployee(employeeId: string) {
    return this.beneficiaryModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
  }

  async findFavorites(employeeId: string) {
    return this.beneficiaryModel.find({ employeeId, isFavorite: true }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, data: Partial<Beneficiary>) {
    const beneficiary = await this.beneficiaryModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    return beneficiary;
  }

  async remove(id: string) {
    const beneficiary = await this.beneficiaryModel.findByIdAndDelete(id).exec();
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    return { success: true };
  }
}

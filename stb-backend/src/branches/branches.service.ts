import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument } from './schemas/branch.schema';

@Injectable()
export class BranchesService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<BranchDocument>) {}

  async create(data: Partial<Branch>) {
    const existing = await this.branchModel.findOne({
      $or: [{ name: data.name }, { code: data.code?.toUpperCase() }],
    });
    if (existing) throw new ConflictException('Branch already exists');
    return this.branchModel.create({ ...data, code: data.code?.toUpperCase() });
  }

  async findAll() {
    return this.branchModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, data: Partial<Branch>) {
    const branch = await this.branchModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async remove(id: string) {
    const branch = await this.branchModel.findByIdAndDelete(id).exec();
    if (!branch) throw new NotFoundException('Branch not found');
    return { success: true };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.branchModel.countDocuments(),
      this.branchModel.countDocuments({ isActive: true }),
    ]);
    return { total, active };
  }
}

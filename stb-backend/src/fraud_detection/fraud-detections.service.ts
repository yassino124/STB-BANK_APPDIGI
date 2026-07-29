import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FraudDetection, FraudDetectionDocument } from './schemas/fraud-detection.schema';

@Injectable()
export class FraudDetectionsService {
  constructor(@InjectModel(FraudDetection.name) private fraudDetectionModel: Model<FraudDetectionDocument>) {}

  async create(data: Partial<FraudDetection>) {
    return this.fraudDetectionModel.create(data);
  }

  async findByEmployee(employeeId: string) {
    return this.fraudDetectionModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
  }

  async findHighRisk(threshold = 70) {
    return this.fraudDetectionModel.find({ riskScore: { $gte: threshold }, status: 'INVESTIGATING' as any }).sort({ riskScore: -1 }).exec();
  }

  async findOne(id: string) {
    const detection = await this.fraudDetectionModel.findById(id).exec();
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

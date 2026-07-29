import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiLog, AiLogDocument } from './schemas/ai-log.schema';

@Injectable()
export class AiLogsService {
  constructor(@InjectModel(AiLog.name) private aiLogModel: Model<AiLogDocument>) {}

  async create(data: Partial<AiLog>) {
    return this.aiLogModel.create(data as any);
  }

  async findBySession(sessionId: string) {
    return this.aiLogModel.find({ sessionId }).sort({ createdAt: -1 }).exec();
  }

  async findByEmployee(employeeId: string, limit = 100) {
    return this.aiLogModel.find({ employeeId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findStats(employeeId: string) {
    const [total, successCount, failureCount] = await Promise.all([
      this.aiLogModel.countDocuments({ employeeId }),
      this.aiLogModel.countDocuments({ employeeId, success: true }),
      this.aiLogModel.countDocuments({ employeeId, success: false }),
    ]);
    return { total, successCount, failureCount, successRate: total > 0 ? (successCount / total) * 100 : 0 };
  }
}

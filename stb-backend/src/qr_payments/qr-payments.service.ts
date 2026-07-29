import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QrPayment, QrPaymentDocument } from './schemas/qr-payment.schema';

@Injectable()
export class QrPaymentsService {
  constructor(@InjectModel(QrPayment.name) private qrPaymentModel: Model<QrPaymentDocument>) {}

  async create(data: Partial<QrPayment>) {
    return this.qrPaymentModel.create(data);
  }

  async findByEmployee(employeeId: string, limit = 50) {
    return this.qrPaymentModel.find({ employeeId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findOne(id: string) {
    const qrPayment = await this.qrPaymentModel.findById(id).exec();
    if (!qrPayment) throw new NotFoundException('QR Payment not found');
    return qrPayment;
  }

  async updateStatus(id: string, status: string) {
    const qrPayment = await this.qrPaymentModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!qrPayment) throw new NotFoundException('QR Payment not found');
    return qrPayment;
  }
}

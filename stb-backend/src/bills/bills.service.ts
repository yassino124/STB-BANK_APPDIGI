import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bill, BillDocument } from './schemas/bill.schema';

@Injectable()
export class BillsService {
  constructor(@InjectModel(Bill.name) private billModel: Model<BillDocument>) {}

  async create(data: Partial<Bill> & { reference?: string }) {
    // Map 'reference' to 'referenceNumber' for compatibility
    const billData: any = { ...data };
    
    if (data.reference && !data.referenceNumber) {
      billData.referenceNumber = data.reference;
      delete billData.reference;
    }
    
    // Set billerId from billType if not provided
    if (!billData.billerId && billData.billType) {
      billData.billerId = billData.billType;
    }
    
    // Set status to PAID immediately (instant payment)
    billData.status = 'PAID';
    billData.paidAt = new Date();
    
    console.log('💳 Creating bill:', billData);
    
    return this.billModel.create(billData);
  }

  async findByEmployee(employeeId: string) {
    return this.billModel.find({ employeeId }).sort({ dueDate: 1 }).exec();
  }

  async findOne(id: string) {
    const bill = await this.billModel.findById(id).exec();
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async updateStatus(id: string, status: string) {
    const bill = await this.billModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }
}

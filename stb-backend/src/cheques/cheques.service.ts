import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChequeRequest } from './cheques.schema';
import { CreateChequeRequestDto } from './dto/cheques.dto';

@Injectable()
export class ChequesService {
  constructor(@InjectModel(ChequeRequest.name) private model: Model<ChequeRequest>) {}

  async create(employeeId: string, dto: CreateChequeRequestDto) {
    const req = new this.model({
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type,
      status: 'PENDING'
    });
    return req.save();
  }

  async findByEmployee(employeeId: string) {
    return this.model.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async findAll() {
    return this.model.find().populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string) {
    const req = await this.model.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }
}

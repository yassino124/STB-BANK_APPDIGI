import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) {}

  async create(data: Partial<Service>) {
    const existing = await this.serviceModel.findOne({ name: data.name });
    if (existing) throw new ConflictException('Service already exists');
    return this.serviceModel.create(data);
  }

  async findAll() {
    return this.serviceModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, data: Partial<Service>) {
    const service = await this.serviceModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async remove(id: string) {
    const service = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!service) throw new NotFoundException('Service not found');
    return { success: true };
  }
}

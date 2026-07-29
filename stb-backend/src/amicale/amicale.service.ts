import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmicaleOffer } from './amicale.schema';
import { CreateAmicaleOfferDto, UpdateAmicaleOfferDto } from './dto/amicale.dto';

@Injectable()
export class AmicaleService {
  constructor(@InjectModel(AmicaleOffer.name) private model: Model<AmicaleOffer>) {}

  async findAllActive() {
    return this.model.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const offer = await this.model.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async create(dto: CreateAmicaleOfferDto) {
    const offer = new this.model(dto);
    return offer.save();
  }

  async update(id: string, dto: UpdateAmicaleOfferDto) {
    const offer = await this.model.findByIdAndUpdate(id, { $set: dto }, { new: true });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async remove(id: string) {
    const offer = await this.model.findByIdAndDelete(id);
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from './schemas/currency.schema';

@Injectable()
export class CurrenciesService {
  constructor(@InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>) {}

  async create(data: Partial<Currency>) {
    const existing = await this.currencyModel.findOne({ code: data.code?.toUpperCase() });
    if (existing) throw new ConflictException('Currency already exists');
    return this.currencyModel.create({ ...data, code: data.code?.toUpperCase() });
  }

  async findAll() {
    return this.currencyModel.find().sort({ code: 1 }).exec();
  }

  async findOne(id: string) {
    const currency = await this.currencyModel.findById(id).exec();
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async findByCode(code: string) {
    return this.currencyModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async update(id: string, data: Partial<Currency>) {
    const currency = await this.currencyModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async remove(id: string) {
    const currency = await this.currencyModel.findByIdAndDelete(id).exec();
    if (!currency) throw new NotFoundException('Currency not found');
    return { success: true };
  }

  async seedDefaultCurrencies() {
    const defaults = [
      { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimalPlaces: 3 },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
    ];
    for (const currency of defaults) {
      await this.currencyModel.findOneAndUpdate({ code: currency.code }, currency, { upsert: true, new: true });
    }
    return this.findAll();
  }
}

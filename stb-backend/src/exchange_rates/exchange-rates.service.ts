import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';

@Injectable()
export class ExchangeRatesService {
  constructor(@InjectModel(ExchangeRate.name) private exchangeRateModel: Model<ExchangeRateDocument>) {}

  async create(data: Partial<ExchangeRate>) {
    return this.exchangeRateModel.create(data);
  }

  async findLatest(fromCurrency: string, toCurrency: string) {
    return this.exchangeRateModel
      .findOne({ fromCurrency, toCurrency })
      .sort({ effectiveDate: -1 })
      .exec();
  }

  async findHistory(fromCurrency: string, toCurrency: string, limit = 30) {
    return this.exchangeRateModel
      .find({ fromCurrency, toCurrency })
      .sort({ effectiveDate: -1 })
      .limit(limit)
      .exec();
  }

  async findAll() {
    return this.exchangeRateModel.find().sort({ fromCurrency: 1, effectiveDate: -1 }).exec();
  }

  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;
    const rate = await this.findLatest(fromCurrency, toCurrency);
    if (!rate) throw new NotFoundException(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount * rate.rate;
  }
}

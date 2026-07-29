import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async create(data: Partial<Setting>) {
    return this.settingModel.create(data);
  }

  async findByKey(key: string) {
    const setting = await this.settingModel.findOne({ key: key.toUpperCase() }).exec();
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async findByCategory(category: string) {
    return this.settingModel.find({ category }).sort({ key: 1 }).exec();
  }

  async findAll() {
    return this.settingModel.find().sort({ category: 1, key: 1 }).exec();
  }

  async update(key: string, value: any) {
    const setting = await this.settingModel.findOneAndUpdate({ key: key.toUpperCase() }, { value }, { new: true }).exec();
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async setMany(settings: Record<string, any>) {
    const operations = Object.entries(settings).map(([key, value]) => ({
      updateOne: { filter: { key: key.toUpperCase() }, update: { value }, upsert: true },
    }));
    return this.settingModel.bulkWrite(operations);
  }
}

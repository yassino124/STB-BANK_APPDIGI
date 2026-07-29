import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(@InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>) {}

  async create(employeeId: string, data: Partial<Favorite>) {
    const existing = await this.favoriteModel.findOne({
      employeeId,
      referenceId: data.referenceId,
    });
    if (existing) throw new ConflictException('Favorite already exists');
    return this.favoriteModel.create({ ...data, employeeId });
  }

  async findByEmployee(employeeId: string) {
    return this.favoriteModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
  }

  async findByType(employeeId: string, type: string) {
    return this.favoriteModel.find({ employeeId: employeeId as any, type: type as any }).sort({ createdAt: -1 }).exec();
  }

  async remove(id: string) {
    const favorite = await this.favoriteModel.findByIdAndDelete(id).exec();
    if (!favorite) throw new NotFoundException('Favorite not found');
    return { success: true };
  }
}

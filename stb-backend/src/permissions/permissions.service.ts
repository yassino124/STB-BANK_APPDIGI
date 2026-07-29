import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>) {}

  async create(data: Partial<Permission>) {
    const existing = await this.permissionModel.findOne({
      name: data.name?.toUpperCase(),
    });
    if (existing) throw new ConflictException('Permission already exists');
    return this.permissionModel.create({ ...data, name: data.name?.toUpperCase() });
  }

  async findAll() {
    return this.permissionModel.find().sort({ resource: 1, action: 1 }).exec();
  }

  async findOne(id: string) {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async findByResource(resource: string) {
    return this.permissionModel.find({ resource }).exec();
  }

  async update(id: string, data: Partial<Permission>) {
    const permission = await this.permissionModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async remove(id: string) {
    const permission = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!permission) throw new NotFoundException('Permission not found');
    return { success: true };
  }
}

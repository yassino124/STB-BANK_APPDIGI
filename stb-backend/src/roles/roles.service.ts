import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(data: Partial<Role>) {
    const existing = await this.roleModel.findOne({ name: data.name?.toUpperCase() });
    if (existing) throw new ConflictException('Role already exists');
    return this.roleModel.create({ ...data, name: data.name?.toUpperCase() });
  }

  async findAll() {
    return this.roleModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const role = await this.roleModel.findById(id).exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, data: Partial<Role>) {
    const role = await this.roleModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async remove(id: string) {
    const role = await this.roleModel.findByIdAndDelete(id).exec();
    if (!role) throw new NotFoundException('Role not found');
    return { success: true };
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { Employee, EmployeeDocument } from '../employees/employee.schema';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(data: Partial<Department>) {
    const existing = await this.departmentModel.findOne({
      $or: [{ name: data.name }, { code: data.code?.toUpperCase() }],
    });
    if (existing) throw new ConflictException('Department already exists');
    return this.departmentModel.create({ ...data, code: data.code?.toUpperCase() });
  }

  async findAll() {
    return this.departmentModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async update(id: string, data: Partial<Department>) {
    const department = await this.departmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async remove(id: string) {
    const department = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!department) throw new NotFoundException('Department not found');
    return { success: true };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.departmentModel.countDocuments(),
      this.departmentModel.countDocuments({ isActive: true }),
    ]);
    return { total, active };
  }

  async updateEmployeeCount(departmentId: string) {
    const count = await this.employeeModel.countDocuments({ departmentId: new (require('mongoose')).default.Types.ObjectId(departmentId) });
    await this.departmentModel.findByIdAndUpdate(departmentId, { employeeCount: count });
  }
}

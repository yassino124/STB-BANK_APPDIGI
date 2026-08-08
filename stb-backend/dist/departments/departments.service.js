"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const department_schema_1 = require("./schemas/department.schema");
const employee_schema_1 = require("../employees/employee.schema");
let DepartmentsService = class DepartmentsService {
    departmentModel;
    employeeModel;
    constructor(departmentModel, employeeModel) {
        this.departmentModel = departmentModel;
        this.employeeModel = employeeModel;
    }
    async create(data) {
        const existing = await this.departmentModel.findOne({
            $or: [{ name: data.name }, { code: data.code?.toUpperCase() }],
        });
        if (existing)
            throw new common_1.ConflictException('Department already exists');
        return this.departmentModel.create({ ...data, code: data.code?.toUpperCase() });
    }
    async findAll() {
        return this.departmentModel.find().populate('managerId', 'nom prenom matricule').sort({ name: 1 }).exec();
    }
    async findOne(id) {
        const department = await this.departmentModel.findById(id).exec();
        if (!department)
            throw new common_1.NotFoundException('Department not found');
        return department;
    }
    async update(id, data) {
        const department = await this.departmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!department)
            throw new common_1.NotFoundException('Department not found');
        return department;
    }
    async remove(id) {
        const department = await this.departmentModel.findByIdAndDelete(id).exec();
        if (!department)
            throw new common_1.NotFoundException('Department not found');
        return { success: true };
    }
    async getStats() {
        const [total, active] = await Promise.all([
            this.departmentModel.countDocuments(),
            this.departmentModel.countDocuments({ isActive: true }),
        ]);
        return { total, active };
    }
    async updateEmployeeCount(departmentId) {
        const count = await this.employeeModel.countDocuments({ departmentId: new (require('mongoose')).default.Types.ObjectId(departmentId) });
        await this.departmentModel.findByIdAndUpdate(departmentId, { employeeCount: count });
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map
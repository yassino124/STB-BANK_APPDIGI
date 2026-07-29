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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("./schemas/role.schema");
let RolesService = class RolesService {
    roleModel;
    constructor(roleModel) {
        this.roleModel = roleModel;
    }
    async create(data) {
        const existing = await this.roleModel.findOne({ name: data.name?.toUpperCase() });
        if (existing)
            throw new common_1.ConflictException('Role already exists');
        return this.roleModel.create({ ...data, name: data.name?.toUpperCase() });
    }
    async findAll() {
        return this.roleModel.find().sort({ name: 1 }).exec();
    }
    async findOne(id) {
        const role = await this.roleModel.findById(id).exec();
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async update(id, data) {
        const role = await this.roleModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async remove(id) {
        const role = await this.roleModel.findByIdAndDelete(id).exec();
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return { success: true };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map
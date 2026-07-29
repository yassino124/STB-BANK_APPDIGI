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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const permission_schema_1 = require("./schemas/permission.schema");
let PermissionsService = class PermissionsService {
    permissionModel;
    constructor(permissionModel) {
        this.permissionModel = permissionModel;
    }
    async create(data) {
        const existing = await this.permissionModel.findOne({
            name: data.name?.toUpperCase(),
        });
        if (existing)
            throw new common_1.ConflictException('Permission already exists');
        return this.permissionModel.create({ ...data, name: data.name?.toUpperCase() });
    }
    async findAll() {
        return this.permissionModel.find().sort({ resource: 1, action: 1 }).exec();
    }
    async findOne(id) {
        const permission = await this.permissionModel.findById(id).exec();
        if (!permission)
            throw new common_1.NotFoundException('Permission not found');
        return permission;
    }
    async findByResource(resource) {
        return this.permissionModel.find({ resource }).exec();
    }
    async update(id, data) {
        const permission = await this.permissionModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!permission)
            throw new common_1.NotFoundException('Permission not found');
        return permission;
    }
    async remove(id) {
        const permission = await this.permissionModel.findByIdAndDelete(id).exec();
        if (!permission)
            throw new common_1.NotFoundException('Permission not found');
        return { success: true };
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map
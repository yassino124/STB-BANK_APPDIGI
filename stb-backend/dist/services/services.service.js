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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const service_schema_1 = require("./schemas/service.schema");
let ServicesService = class ServicesService {
    serviceModel;
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
    }
    async create(data) {
        const existing = await this.serviceModel.findOne({ name: data.name });
        if (existing)
            throw new common_1.ConflictException('Service already exists');
        return this.serviceModel.create(data);
    }
    async findAll() {
        return this.serviceModel.find().sort({ name: 1 }).exec();
    }
    async findOne(id) {
        const service = await this.serviceModel.findById(id).exec();
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
    async update(id, data) {
        const service = await this.serviceModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
    async remove(id) {
        const service = await this.serviceModel.findByIdAndDelete(id).exec();
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return { success: true };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServicesService);
//# sourceMappingURL=services.service.js.map
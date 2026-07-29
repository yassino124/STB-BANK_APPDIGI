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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const setting_schema_1 = require("./schemas/setting.schema");
let SettingsService = class SettingsService {
    settingModel;
    constructor(settingModel) {
        this.settingModel = settingModel;
    }
    async create(data) {
        return this.settingModel.create(data);
    }
    async findByKey(key) {
        const setting = await this.settingModel.findOne({ key: key.toUpperCase() }).exec();
        if (!setting)
            throw new common_1.NotFoundException('Setting not found');
        return setting;
    }
    async findByCategory(category) {
        return this.settingModel.find({ category }).sort({ key: 1 }).exec();
    }
    async findAll() {
        return this.settingModel.find().sort({ category: 1, key: 1 }).exec();
    }
    async update(key, value) {
        const setting = await this.settingModel.findOneAndUpdate({ key: key.toUpperCase() }, { value }, { new: true }).exec();
        if (!setting)
            throw new common_1.NotFoundException('Setting not found');
        return setting;
    }
    async setMany(settings) {
        const operations = Object.entries(settings).map(([key, value]) => ({
            updateOne: { filter: { key: key.toUpperCase() }, update: { value }, upsert: true },
        }));
        return this.settingModel.bulkWrite(operations);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(setting_schema_1.Setting.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SettingsService);
//# sourceMappingURL=settings.service.js.map
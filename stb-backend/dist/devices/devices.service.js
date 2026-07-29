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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const device_schema_1 = require("./device.schema");
let DevicesService = class DevicesService {
    deviceModel;
    constructor(deviceModel) {
        this.deviceModel = deviceModel;
    }
    async getMyDevices(employeeId) {
        return this.deviceModel
            .find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .sort({ lastLoginAt: -1 })
            .exec();
    }
    async removeDevice(employeeId, deviceId) {
        const device = await this.deviceModel.findOne({
            _id: deviceId,
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
        });
        if (!device)
            throw new common_1.NotFoundException('Appareil introuvable.');
        await this.deviceModel.deleteOne({ _id: deviceId });
        return { message: 'Appareil supprimé avec succès.' };
    }
    async revokeTrust(employeeId, deviceId) {
        const device = await this.deviceModel.findOne({
            _id: deviceId,
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
        });
        if (!device)
            throw new common_1.NotFoundException('Appareil introuvable.');
        await this.deviceModel.updateOne({ _id: deviceId }, { trusted: false, biometricsEnabled: false });
        return { message: 'Confiance révoquée pour cet appareil.' };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DevicesService);
//# sourceMappingURL=devices.service.js.map
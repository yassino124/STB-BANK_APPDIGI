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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSchema = exports.Device = exports.Platform = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var Platform;
(function (Platform) {
    Platform["IOS"] = "iOS";
    Platform["ANDROID"] = "Android";
    Platform["WEB"] = "Web";
})(Platform || (exports.Platform = Platform = {}));
let Device = class Device {
    employeeId;
    deviceUUID;
    deviceName;
    platform;
    model;
    osVersion;
    trusted;
    lastLoginAt;
    lastLoginIp;
    lastLoginLocation;
    biometricsEnabled;
    loginCount;
};
exports.Device = Device;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Device.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, type: String }),
    __metadata("design:type", String)
], Device.prototype, "deviceUUID", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Device.prototype, "deviceName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Platform, default: Platform.IOS }),
    __metadata("design:type", String)
], Device.prototype, "platform", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Device.prototype, "model", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Device.prototype, "osVersion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Device.prototype, "trusted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Device.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Device.prototype, "lastLoginIp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Device.prototype, "lastLoginLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Device.prototype, "biometricsEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Device.prototype, "loginCount", void 0);
exports.Device = Device = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'devices' })
], Device);
exports.DeviceSchema = mongoose_1.SchemaFactory.createForClass(Device);
exports.DeviceSchema.index({ employeeId: 1, trusted: 1 });
//# sourceMappingURL=device.schema.js.map
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
exports.SettingSchema = exports.Setting = exports.SettingType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SettingType;
(function (SettingType) {
    SettingType["STRING"] = "STRING";
    SettingType["NUMBER"] = "NUMBER";
    SettingType["BOOLEAN"] = "BOOLEAN";
    SettingType["JSON"] = "JSON";
    SettingType["ARRAY"] = "ARRAY";
})(SettingType || (exports.SettingType = SettingType = {}));
let Setting = class Setting {
    key;
    value;
    type;
    category;
    description;
    isPublic;
    updatedBy;
};
exports.Setting = Setting;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true, uppercase: true }),
    __metadata("design:type", String)
], Setting.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Setting.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: SettingType, default: SettingType.STRING }),
    __metadata("design:type", String)
], Setting.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'GENERAL', index: true }),
    __metadata("design:type", String)
], Setting.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Setting.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Setting.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Setting.prototype, "updatedBy", void 0);
exports.Setting = Setting = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'settings' })
], Setting);
exports.SettingSchema = mongoose_1.SchemaFactory.createForClass(Setting);
exports.SettingSchema.index({ category: 1, key: 1 });
//# sourceMappingURL=setting.schema.js.map
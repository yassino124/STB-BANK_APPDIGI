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
exports.ServiceSchema = exports.Service = exports.ServiceCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["BANKING"] = "BANKING";
    ServiceCategory["HR"] = "HR";
    ServiceCategory["FINANCE"] = "FINANCE";
    ServiceCategory["IT"] = "IT";
    ServiceCategory["SUPPORT"] = "SUPPORT";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
let Service = class Service {
    name;
    description;
    category;
    isActive;
};
exports.Service = Service;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ServiceCategory, required: true, index: true }),
    __metadata("design:type", String)
], Service.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Service.prototype, "isActive", void 0);
exports.Service = Service = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'services' })
], Service);
exports.ServiceSchema = mongoose_1.SchemaFactory.createForClass(Service);
exports.ServiceSchema.index({ category: 1, isActive: 1 });
//# sourceMappingURL=service.schema.js.map
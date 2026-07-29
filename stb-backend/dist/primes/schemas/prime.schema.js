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
exports.PrimeSchema = exports.Prime = exports.PrimeStatus = exports.PrimeType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PrimeType;
(function (PrimeType) {
    PrimeType["PERFORMANCE"] = "PERFORMANCE";
    PrimeType["AID"] = "AID";
    PrimeType["RAMADAN"] = "RAMADAN";
    PrimeType["VACANCES"] = "VACANCES";
    PrimeType["ANCIENNETE"] = "ANCIENNETE";
    PrimeType["EXCEPTIONNELLE"] = "EXCEPTIONNELLE";
})(PrimeType || (exports.PrimeType = PrimeType = {}));
var PrimeStatus;
(function (PrimeStatus) {
    PrimeStatus["PENDING"] = "PENDING";
    PrimeStatus["APPROVED"] = "APPROVED";
    PrimeStatus["REJECTED"] = "REJECTED";
    PrimeStatus["PAID"] = "PAID";
})(PrimeStatus || (exports.PrimeStatus = PrimeStatus = {}));
let Prime = class Prime extends mongoose_2.Document {
    employeeId;
    type;
    montant;
    status;
    description;
    approvedBy;
    approvedAt;
    payrollId;
};
exports.Prime = Prime;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prime.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: PrimeType, required: true }),
    __metadata("design:type", String)
], Prime.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Prime.prototype, "montant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: PrimeStatus, default: PrimeStatus.PENDING }),
    __metadata("design:type", String)
], Prime.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Prime.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prime.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Prime.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prime.prototype, "payrollId", void 0);
exports.Prime = Prime = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Prime);
exports.PrimeSchema = mongoose_1.SchemaFactory.createForClass(Prime);
exports.PrimeSchema.index({ employeeId: 1, status: 1 });
//# sourceMappingURL=prime.schema.js.map
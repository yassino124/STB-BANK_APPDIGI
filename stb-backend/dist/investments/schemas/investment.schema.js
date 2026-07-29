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
exports.InvestmentSchema = exports.Investment = exports.InvestmentStatus = exports.RiskLevel = exports.InvestmentType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var InvestmentType;
(function (InvestmentType) {
    InvestmentType["STOCKS"] = "STOCKS";
    InvestmentType["FUNDS"] = "FUNDS";
    InvestmentType["BONDS"] = "BONDS";
    InvestmentType["CRYPTO"] = "CRYPTO";
    InvestmentType["SAVINGS_PLAN"] = "SAVINGS_PLAN";
})(InvestmentType || (exports.InvestmentType = InvestmentType = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["ACTIVE"] = "ACTIVE";
    InvestmentStatus["MATURED"] = "MATURED";
    InvestmentStatus["CANCELLED"] = "CANCELLED";
    InvestmentStatus["LOST"] = "LOST";
})(InvestmentStatus || (exports.InvestmentStatus = InvestmentStatus = {}));
let Investment = class Investment {
    employeeId;
    type;
    name;
    description;
    initialAmount;
    currentValue;
    currency;
    startDate;
    endDate;
    expectedReturn;
    riskLevel;
    status;
    accountId;
    metadata;
};
exports.Investment = Investment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Investment.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: InvestmentType, index: true }),
    __metadata("design:type", String)
], Investment.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Investment.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Investment.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Investment.prototype, "initialAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Investment.prototype, "currentValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND', uppercase: true }),
    __metadata("design:type", String)
], Investment.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], Investment.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", Object)
], Investment.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0 }),
    __metadata("design:type", Number)
], Investment.prototype, "expectedReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: RiskLevel, index: true }),
    __metadata("design:type", String)
], Investment.prototype, "riskLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: InvestmentStatus, default: InvestmentStatus.ACTIVE, index: true }),
    __metadata("design:type", String)
], Investment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', default: null }),
    __metadata("design:type", Object)
], Investment.prototype, "accountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Investment.prototype, "metadata", void 0);
exports.Investment = Investment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'investments' })
], Investment);
exports.InvestmentSchema = mongoose_1.SchemaFactory.createForClass(Investment);
exports.InvestmentSchema.index({ employeeId: 1, status: 1 });
exports.InvestmentSchema.index({ type: 1, status: 1 });
//# sourceMappingURL=investment.schema.js.map
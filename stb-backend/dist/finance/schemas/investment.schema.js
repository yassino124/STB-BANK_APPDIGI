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
exports.InvestmentSchema = exports.Investment = exports.InvestmentStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["PENDING"] = "PENDING";
    InvestmentStatus["APPROVED"] = "APPROVED";
    InvestmentStatus["ACTIVE"] = "ACTIVE";
    InvestmentStatus["COMPLETED"] = "COMPLETED";
    InvestmentStatus["REJECTED"] = "REJECTED";
})(InvestmentStatus || (exports.InvestmentStatus = InvestmentStatus = {}));
let Investment = class Investment extends mongoose_2.Document {
    employeeId;
    name;
    amount;
    expectedReturn;
    actualReturn;
    status;
    approvedBy;
    approvedAt;
    commentaire;
    metadata;
};
exports.Investment = Investment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Investment.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Investment.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Investment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Investment.prototype, "expectedReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Investment.prototype, "actualReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: InvestmentStatus, default: InvestmentStatus.PENDING }),
    __metadata("design:type", String)
], Investment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Investment.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Investment.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Investment.prototype, "commentaire", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Investment.prototype, "metadata", void 0);
exports.Investment = Investment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Investment);
exports.InvestmentSchema = mongoose_1.SchemaFactory.createForClass(Investment);
exports.InvestmentSchema.index({ employeeId: 1, status: 1 });
//# sourceMappingURL=investment.schema.js.map
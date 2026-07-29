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
exports.RechargeSchema = exports.Recharge = exports.RechargeStatus = exports.Operator = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var Operator;
(function (Operator) {
    Operator["ORANGE"] = "ORANGE";
    Operator["TUNISIE_TELECOM"] = "TUNISIE_TELECOM";
    Operator["OOREDOO"] = "OOREDOO";
})(Operator || (exports.Operator = Operator = {}));
var RechargeStatus;
(function (RechargeStatus) {
    RechargeStatus["PENDING"] = "PENDING";
    RechargeStatus["COMPLETED"] = "COMPLETED";
    RechargeStatus["FAILED"] = "FAILED";
})(RechargeStatus || (exports.RechargeStatus = RechargeStatus = {}));
let Recharge = class Recharge {
    employeeId;
    phoneNumber;
    operator;
    amount;
    currency;
    status;
    accountId;
    transactionId;
};
exports.Recharge = Recharge;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Recharge.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Recharge.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Operator, index: true }),
    __metadata("design:type", String)
], Recharge.prototype, "operator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Recharge.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND', uppercase: true }),
    __metadata("design:type", String)
], Recharge.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: RechargeStatus, default: RechargeStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Recharge.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', default: null }),
    __metadata("design:type", Object)
], Recharge.prototype, "accountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Transaction', default: null }),
    __metadata("design:type", Object)
], Recharge.prototype, "transactionId", void 0);
exports.Recharge = Recharge = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'recharges' })
], Recharge);
exports.RechargeSchema = mongoose_1.SchemaFactory.createForClass(Recharge);
exports.RechargeSchema.index({ employeeId: 1, createdAt: -1 });
//# sourceMappingURL=recharge.schema.js.map
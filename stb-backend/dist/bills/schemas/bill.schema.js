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
exports.BillSchema = exports.Bill = exports.BillStatus = exports.BillType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var BillType;
(function (BillType) {
    BillType["ELECTRICITY"] = "ELECTRICITY";
    BillType["WATER"] = "WATER";
    BillType["GAS"] = "GAS";
    BillType["INTERNET"] = "INTERNET";
    BillType["PHONE"] = "PHONE";
    BillType["TV"] = "TV";
    BillType["INSURANCE"] = "INSURANCE";
    BillType["OTHER"] = "OTHER";
    BillType["STEG"] = "STEG";
    BillType["SONEDE"] = "SONEDE";
    BillType["TOPNET"] = "TOPNET";
    BillType["TELECOM"] = "TELECOM";
    BillType["TGM"] = "TGM";
})(BillType || (exports.BillType = BillType = {}));
var BillStatus;
(function (BillStatus) {
    BillStatus["PENDING"] = "PENDING";
    BillStatus["PAID"] = "PAID";
    BillStatus["OVERDUE"] = "OVERDUE";
    BillStatus["CANCELLED"] = "CANCELLED";
})(BillStatus || (exports.BillStatus = BillStatus = {}));
let Bill = class Bill {
    employeeId;
    billerId;
    billerName;
    billType;
    referenceNumber;
    amount;
    currency;
    status;
    dueDate;
    paidAt;
    accountId;
    transactionId;
};
exports.Bill = Bill;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Bill.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, index: true }),
    __metadata("design:type", String)
], Bill.prototype, "billerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Bill.prototype, "billerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BillType, index: true }),
    __metadata("design:type", String)
], Bill.prototype, "billType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Bill.prototype, "referenceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Bill.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND', uppercase: true }),
    __metadata("design:type", String)
], Bill.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BillStatus, default: BillStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Bill.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", Date)
], Bill.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Bill.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', default: null }),
    __metadata("design:type", Object)
], Bill.prototype, "accountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Transaction', default: null }),
    __metadata("design:type", Object)
], Bill.prototype, "transactionId", void 0);
exports.Bill = Bill = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'bills' })
], Bill);
exports.BillSchema = mongoose_1.SchemaFactory.createForClass(Bill);
exports.BillSchema.index({ employeeId: 1, status: 1 });
exports.BillSchema.index({ billerId: 1, referenceNumber: 1 });
//# sourceMappingURL=bill.schema.js.map
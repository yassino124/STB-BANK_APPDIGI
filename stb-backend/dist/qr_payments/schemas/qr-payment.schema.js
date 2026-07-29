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
exports.QrPaymentSchema = exports.QrPayment = exports.QrPaymentStatus = exports.QrPaymentType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QrPaymentType;
(function (QrPaymentType) {
    QrPaymentType["STATIC"] = "STATIC";
    QrPaymentType["DYNAMIC"] = "DYNAMIC";
})(QrPaymentType || (exports.QrPaymentType = QrPaymentType = {}));
var QrPaymentStatus;
(function (QrPaymentStatus) {
    QrPaymentStatus["PENDING"] = "PENDING";
    QrPaymentStatus["COMPLETED"] = "COMPLETED";
    QrPaymentStatus["EXPIRED"] = "EXPIRED";
    QrPaymentStatus["CANCELLED"] = "CANCELLED";
})(QrPaymentStatus || (exports.QrPaymentStatus = QrPaymentStatus = {}));
let QrPayment = class QrPayment {
    employeeId;
    type;
    amount;
    currency;
    merchantName;
    merchantId;
    status;
    qrData;
    expiresAt;
    completedAt;
    accountId;
};
exports.QrPayment = QrPayment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QrPayment.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: QrPaymentType, index: true }),
    __metadata("design:type", String)
], QrPayment.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0 }),
    __metadata("design:type", Number)
], QrPayment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND', uppercase: true }),
    __metadata("design:type", String)
], QrPayment.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], QrPayment.prototype, "merchantName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], QrPayment.prototype, "merchantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: QrPaymentStatus, default: QrPaymentStatus.PENDING, index: true }),
    __metadata("design:type", String)
], QrPayment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QrPayment.prototype, "qrData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], QrPayment.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], QrPayment.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], QrPayment.prototype, "accountId", void 0);
exports.QrPayment = QrPayment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'qr_payments' })
], QrPayment);
exports.QrPaymentSchema = mongoose_1.SchemaFactory.createForClass(QrPayment);
exports.QrPaymentSchema.index({ employeeId: 1, createdAt: -1 });
exports.QrPaymentSchema.index({ status: 1, expiresAt: 1 });
//# sourceMappingURL=qr-payment.schema.js.map
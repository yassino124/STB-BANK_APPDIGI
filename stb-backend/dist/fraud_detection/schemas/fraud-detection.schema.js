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
exports.FraudDetectionSchema = exports.FraudDetection = exports.FraudStatus = exports.FraudType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var FraudType;
(function (FraudType) {
    FraudType["CARD_FRAUD"] = "CARD_FRAUD";
    FraudType["IDENTITY_THEFT"] = "IDENTITY_THEFT";
    FraudType["ACCOUNT_TAKEOVER"] = "ACCOUNT_TAKEOVER";
    FraudType["MONEY_LAUNDERING"] = "MONEY_LAUNDERING";
    FraudType["SUSPICIOUS_PATTERN"] = "SUSPICIOUS_PATTERN";
})(FraudType || (exports.FraudType = FraudType = {}));
var FraudStatus;
(function (FraudStatus) {
    FraudStatus["INVESTIGATING"] = "INVESTIGATING";
    FraudStatus["CONFIRMED"] = "CONFIRMED";
    FraudStatus["DISMISSED"] = "DISMISSED";
})(FraudStatus || (exports.FraudStatus = FraudStatus = {}));
let FraudDetection = class FraudDetection {
    employeeId;
    transactionId;
    alertId;
    type;
    riskScore;
    factors;
    details;
    status;
    assignedTo;
    actionTaken;
};
exports.FraudDetection = FraudDetection;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FraudDetection.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Transaction', default: null }),
    __metadata("design:type", Object)
], FraudDetection.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RiskAlert', default: null }),
    __metadata("design:type", Object)
], FraudDetection.prototype, "alertId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: FraudType, index: true }),
    __metadata("design:type", String)
], FraudDetection.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 100 }),
    __metadata("design:type", Number)
], FraudDetection.prototype, "riskScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], FraudDetection.prototype, "factors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], FraudDetection.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: FraudStatus, default: FraudStatus.INVESTIGATING, index: true }),
    __metadata("design:type", String)
], FraudDetection.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], FraudDetection.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], FraudDetection.prototype, "actionTaken", void 0);
exports.FraudDetection = FraudDetection = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'fraud_detections' })
], FraudDetection);
exports.FraudDetectionSchema = mongoose_1.SchemaFactory.createForClass(FraudDetection);
exports.FraudDetectionSchema.index({ employeeId: 1, createdAt: -1 });
exports.FraudDetectionSchema.index({ riskScore: -1 });
exports.FraudDetectionSchema.index({ status: 1, createdAt: -1 });
//# sourceMappingURL=fraud-detection.schema.js.map
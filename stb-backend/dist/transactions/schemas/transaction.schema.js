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
exports.TransactionSchema = exports.Transaction = exports.TransactionCategory = exports.TransactionStatus = exports.TransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TransactionType;
(function (TransactionType) {
    TransactionType["SALARY"] = "SALARY";
    TransactionType["CREDIT_DEBIT"] = "CREDIT_DEBIT";
    TransactionType["PRIME"] = "PRIME";
    TransactionType["AVANCE"] = "AVANCE";
    TransactionType["CONGE"] = "CONGE";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["PAYMENT"] = "PAYMENT";
    TransactionType["BONUS"] = "BONUS";
    TransactionType["RECHARGE"] = "RECHARGE";
    TransactionType["BILL_PAYMENT"] = "BILL_PAYMENT";
    TransactionType["QR_PAYMENT"] = "QR_PAYMENT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["CREDIT_PAYMENT"] = "CREDIT_PAYMENT";
    TransactionType["INVESTMENT"] = "INVESTMENT";
    TransactionType["FEE"] = "FEE";
    TransactionType["REFUND"] = "REFUND";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["REVERSED"] = "REVERSED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionCategory;
(function (TransactionCategory) {
    TransactionCategory["INCOME"] = "INCOME";
    TransactionCategory["FOOD"] = "FOOD";
    TransactionCategory["TRANSPORT"] = "TRANSPORT";
    TransactionCategory["ENTERTAINMENT"] = "ENTERTAINMENT";
    TransactionCategory["SHOPPING"] = "SHOPPING";
    TransactionCategory["BILLS"] = "BILLS";
    TransactionCategory["HEALTH"] = "HEALTH";
    TransactionCategory["EDUCATION"] = "EDUCATION";
    TransactionCategory["TRANSFER"] = "TRANSFER";
    TransactionCategory["SALARY"] = "SALARY";
    TransactionCategory["INVESTMENT"] = "INVESTMENT";
    TransactionCategory["CREDIT"] = "CREDIT";
    TransactionCategory["OTHER"] = "OTHER";
})(TransactionCategory || (exports.TransactionCategory = TransactionCategory = {}));
let Transaction = class Transaction {
    employeeId;
    montant;
    type;
    description;
    status;
    date;
    from;
    to;
    accountId;
    toAccountId;
    cardId;
    reference;
    fee;
    exchangeRate;
    originalAmount;
    originalCurrency;
    category;
    subcategory;
    location;
    merchantName;
    merchantCategoryCode;
    isRecurring;
    recurringId;
    tags;
    fraudScore;
    riskLevel;
    metadata;
};
exports.Transaction = Transaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Transaction.prototype, "montant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TransactionType, index: true }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TransactionStatus, default: TransactionStatus.COMPLETED, index: true }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date, default: Date.now, index: -1 }),
    __metadata("design:type", Date)
], Transaction.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Transaction.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Transaction.prototype, "to", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "accountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', default: null, index: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "toAccountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Card', default: null, index: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "cardId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, trim: true, index: true }),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "fee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Transaction.prototype, "exchangeRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "originalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND', uppercase: true }),
    __metadata("design:type", String)
], Transaction.prototype, "originalCurrency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: TransactionCategory, default: TransactionCategory.OTHER, index: true }),
    __metadata("design:type", String)
], Transaction.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Transaction.prototype, "subcategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Transaction.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Transaction.prototype, "merchantName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Transaction.prototype, "merchantCategoryCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "isRecurring", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Transaction.prototype, "recurringId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Transaction.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Transaction.prototype, "fraudScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW', index: true }),
    __metadata("design:type", String)
], Transaction.prototype, "riskLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
exports.Transaction = Transaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'transactions' })
], Transaction);
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
exports.TransactionSchema.index({ employeeId: 1, date: -1 });
exports.TransactionSchema.index({ accountId: 1, date: -1 });
exports.TransactionSchema.index({ type: 1, status: 1 });
exports.TransactionSchema.index({ category: 1, date: -1 });
exports.TransactionSchema.index({ fraudScore: -1 });
exports.TransactionSchema.index({ employeeId: 1, category: 1, date: -1 });
//# sourceMappingURL=transaction.schema.js.map
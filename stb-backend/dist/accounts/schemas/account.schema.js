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
exports.AccountSchema = exports.Account = exports.AccountStatus = exports.AccountType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AccountType;
(function (AccountType) {
    AccountType["COURANT"] = "COURANT";
    AccountType["EPARGNE"] = "EPARGNE";
    AccountType["DEVISE"] = "DEVISE";
    AccountType["JOINT"] = "JOINT";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["FROZEN"] = "FROZEN";
    AccountStatus["CLOSED"] = "CLOSED";
    AccountStatus["PENDING"] = "PENDING";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
let Account = class Account {
    employeeId;
    rib;
    iban;
    numCompte;
    type;
    status;
    solde;
    currency;
    branchId;
    isPrimary;
    dailyWithdrawalLimit;
    dailyTransferLimit;
    monthlyLimit;
    dailySpent;
    monthlySpent;
    lastWithdrawalReset;
    lastMonthlyReset;
    metadata;
};
exports.Account = Account;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Account.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Account.prototype, "rib", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Account.prototype, "iban", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Account.prototype, "numCompte", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AccountType, default: AccountType.COURANT, index: true }),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AccountStatus, default: AccountStatus.ACTIVE, index: true }),
    __metadata("design:type", String)
], Account.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "solde", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND' }),
    __metadata("design:type", String)
], Account.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Account.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "isPrimary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "dailyWithdrawalLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "dailyTransferLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "monthlyLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "dailySpent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "monthlySpent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "lastWithdrawalReset", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Account.prototype, "lastMonthlyReset", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Account.prototype, "metadata", void 0);
exports.Account = Account = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'accounts' })
], Account);
exports.AccountSchema = mongoose_1.SchemaFactory.createForClass(Account);
exports.AccountSchema.index({ employeeId: 1, status: 1 });
exports.AccountSchema.index({ type: 1, status: 1 });
//# sourceMappingURL=account.schema.js.map
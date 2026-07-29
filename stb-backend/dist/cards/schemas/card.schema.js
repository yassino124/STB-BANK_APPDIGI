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
exports.CardSchema = exports.Card = exports.CardBlockReason = exports.CardStatus = exports.CardType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var CardType;
(function (CardType) {
    CardType["VISA"] = "VISA";
    CardType["MASTERCARD"] = "MASTERCARD";
    CardType["PLATINUM"] = "PLATINUM";
    CardType["BLACK"] = "BLACK";
    CardType["VIRTUAL"] = "VIRTUAL";
    CardType["CORPORATE"] = "CORPORATE";
})(CardType || (exports.CardType = CardType = {}));
var CardStatus;
(function (CardStatus) {
    CardStatus["ACTIVE"] = "ACTIVE";
    CardStatus["FROZEN"] = "FROZEN";
    CardStatus["BLOCKED"] = "BLOCKED";
    CardStatus["EXPIRED"] = "EXPIRED";
    CardStatus["PENDING"] = "PENDING";
    CardStatus["CANCELLED"] = "CANCELLED";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
var CardBlockReason;
(function (CardBlockReason) {
    CardBlockReason["LOST"] = "LOST";
    CardBlockReason["STOLEN"] = "STOLEN";
    CardBlockReason["DAMAGED"] = "DAMAGED";
    CardBlockReason["SUSPICIOUS"] = "SUSPICIOUS";
    CardBlockReason["FRAUD"] = "FRAUD";
    CardBlockReason["CUSTOMER_REQUEST"] = "CUSTOMER_REQUEST";
})(CardBlockReason || (exports.CardBlockReason = CardBlockReason = {}));
let Card = class Card {
    employeeId;
    accountId;
    cardNumber;
    maskedNumber;
    expiryDate;
    cvvHash;
    pinHash;
    type;
    status;
    limitQuotidien;
    limitMensuel;
    isVirtual;
    isFrozen;
    frozenAt;
    frozenBy;
    freezeReason;
    blockReason;
    activatedAt;
    cancelledAt;
    contactlessEnabled;
    onlinePaymentsEnabled;
    internationalEnabled;
    spendingLimits;
    allowedCountries;
    blockedCountries;
    metadata;
};
exports.Card = Card;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Card.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Account', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Card.prototype, "accountId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Card.prototype, "cardNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Card.prototype, "maskedNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Card.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, select: false }),
    __metadata("design:type", String)
], Card.prototype, "cvvHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false }),
    __metadata("design:type", Object)
], Card.prototype, "pinHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: CardType, default: CardType.VISA, index: true }),
    __metadata("design:type", String)
], Card.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: CardStatus, default: CardStatus.ACTIVE, index: true }),
    __metadata("design:type", String)
], Card.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 5000 }),
    __metadata("design:type", Number)
], Card.prototype, "limitQuotidien", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 10000 }),
    __metadata("design:type", Number)
], Card.prototype, "limitMensuel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Card.prototype, "isVirtual", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Card.prototype, "isFrozen", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Card.prototype, "frozenAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, default: null }),
    __metadata("design:type", Object)
], Card.prototype, "frozenBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Card.prototype, "freezeReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: CardBlockReason, default: null }),
    __metadata("design:type", Object)
], Card.prototype, "blockReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Card.prototype, "activatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Card.prototype, "cancelledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Card.prototype, "contactlessEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Card.prototype, "onlinePaymentsEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Card.prototype, "internationalEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Card.prototype, "spendingLimits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Card.prototype, "allowedCountries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Card.prototype, "blockedCountries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Card.prototype, "metadata", void 0);
exports.Card = Card = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'cards' })
], Card);
exports.CardSchema = mongoose_1.SchemaFactory.createForClass(Card);
exports.CardSchema.index({ employeeId: 1, status: 1 });
exports.CardSchema.index({ status: 1, type: 1 });
exports.CardSchema.index({ isFrozen: 1 });
//# sourceMappingURL=card.schema.js.map
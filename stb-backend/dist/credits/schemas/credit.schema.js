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
exports.CreditPaymentSchema = exports.CreditPayment = exports.CreditSchema = exports.Credit = exports.CreditType = exports.CreditStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var CreditStatus;
(function (CreditStatus) {
    CreditStatus["ACTIVE"] = "ACTIVE";
    CreditStatus["CLOSED"] = "CLOSED";
    CreditStatus["LATE"] = "LATE";
    CreditStatus["PENDING"] = "PENDING";
})(CreditStatus || (exports.CreditStatus = CreditStatus = {}));
var CreditType;
(function (CreditType) {
    CreditType["PERSONNEL"] = "PERSONNEL";
    CreditType["IMMOBILIER"] = "IMMOBILIER";
    CreditType["AUTO"] = "AUTO";
    CreditType["MOYEN_TERME"] = "MOYEN_TERME";
})(CreditType || (exports.CreditType = CreditType = {}));
let Credit = class Credit extends mongoose_2.Document {
    employeeId;
    title;
    type;
    montantInitial;
    montantRestant;
    tauxInteret;
    mensualite;
    nombreMois;
    dateDebut;
    dateFin;
    status;
};
exports.Credit = Credit;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Credit.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Credit.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: CreditType, default: CreditType.PERSONNEL }),
    __metadata("design:type", String)
], Credit.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Credit.prototype, "montantInitial", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Credit.prototype, "montantRestant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Credit.prototype, "tauxInteret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Credit.prototype, "mensualite", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Credit.prototype, "nombreMois", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Credit.prototype, "dateDebut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Credit.prototype, "dateFin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: CreditStatus, default: CreditStatus.PENDING }),
    __metadata("design:type", String)
], Credit.prototype, "status", void 0);
exports.Credit = Credit = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Credit);
exports.CreditSchema = mongoose_1.SchemaFactory.createForClass(Credit);
exports.CreditSchema.index({ employeeId: 1, status: 1 });
let CreditPayment = class CreditPayment extends mongoose_2.Document {
    creditId;
    employeeId;
    montant;
    capital;
    interets;
    montantRestantApres;
    datePaiement;
    mode;
    transactionId;
    isLate;
    penalite;
};
exports.CreditPayment = CreditPayment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Credit' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CreditPayment.prototype, "creditId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CreditPayment.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CreditPayment.prototype, "montant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CreditPayment.prototype, "capital", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CreditPayment.prototype, "interets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CreditPayment.prototype, "montantRestantApres", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], CreditPayment.prototype, "datePaiement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'AUTO' }),
    __metadata("design:type", String)
], CreditPayment.prototype, "mode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Transaction' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CreditPayment.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CreditPayment.prototype, "isLate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], CreditPayment.prototype, "penalite", void 0);
exports.CreditPayment = CreditPayment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CreditPayment);
exports.CreditPaymentSchema = mongoose_1.SchemaFactory.createForClass(CreditPayment);
//# sourceMappingURL=credit.schema.js.map
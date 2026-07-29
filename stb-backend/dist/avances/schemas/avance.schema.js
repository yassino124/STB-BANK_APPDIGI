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
exports.AvanceSchema = exports.Avance = exports.AvanceStatut = exports.AvanceType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AvanceType;
(function (AvanceType) {
    AvanceType["SALAIRE"] = "SALAIRE";
    AvanceType["PRIME"] = "PRIME";
    AvanceType["PRIME_AID"] = "PRIME_AID";
})(AvanceType || (exports.AvanceType = AvanceType = {}));
var AvanceStatut;
(function (AvanceStatut) {
    AvanceStatut["EN_ATTENTE"] = "EN_ATTENTE";
    AvanceStatut["APPROUVE"] = "APPROUVE";
    AvanceStatut["REFUSE"] = "REFUSE";
    AvanceStatut["DEBITEE"] = "DEBITEE";
})(AvanceStatut || (exports.AvanceStatut = AvanceStatut = {}));
let Avance = class Avance extends mongoose_2.Document {
    employee;
    type;
    montant;
    motif;
    statut;
    approvedBy;
    approvedAt;
    rejectionReason;
    transactionId;
    debitedAt;
};
exports.Avance = Avance;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Avance.prototype, "employee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AvanceType }),
    __metadata("design:type", String)
], Avance.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Avance.prototype, "montant", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Avance.prototype, "motif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AvanceStatut, default: AvanceStatut.EN_ATTENTE, index: true }),
    __metadata("design:type", String)
], Avance.prototype, "statut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Avance.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Avance.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Avance.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Transaction', default: null }),
    __metadata("design:type", Object)
], Avance.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Avance.prototype, "debitedAt", void 0);
exports.Avance = Avance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Avance);
exports.AvanceSchema = mongoose_1.SchemaFactory.createForClass(Avance);
exports.AvanceSchema.index({ employee: 1, statut: 1 });
exports.AvanceSchema.index({ createdAt: -1 });
//# sourceMappingURL=avance.schema.js.map
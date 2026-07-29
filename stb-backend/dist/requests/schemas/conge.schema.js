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
exports.CongeSchema = exports.Conge = exports.CONGE_RULES = exports.CongeStatus = exports.CongeType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var CongeType;
(function (CongeType) {
    CongeType["REPOS"] = "REPOS";
    CongeType["MALADIE"] = "MALADIE";
    CongeType["MARIAGE"] = "MARIAGE";
    CongeType["NAISSANCE"] = "NAISSANCE";
    CongeType["DECES"] = "DECES";
    CongeType["PELERINAGE"] = "PELERINAGE";
    CongeType["SANS_SOLDE"] = "SANS_SOLDE";
})(CongeType || (exports.CongeType = CongeType = {}));
var CongeStatus;
(function (CongeStatus) {
    CongeStatus["EN_ATTENTE"] = "EN_ATTENTE";
    CongeStatus["EN_ATTENTE_RH"] = "EN_ATTENTE_RH";
    CongeStatus["EN_ATTENTE_DG"] = "EN_ATTENTE_DG";
    CongeStatus["APPROUVE"] = "APPROUVE";
    CongeStatus["REFUSE"] = "REFUSE";
})(CongeStatus || (exports.CongeStatus = CongeStatus = {}));
exports.CONGE_RULES = {
    REPOS: { dureeMax: null, deductFromSolde: true, justificatifRequis: false, limiteCarriere: null },
    MALADIE: { dureeMax: null, deductFromSolde: true, justificatifRequis: true, limiteCarriere: null },
    MARIAGE: { dureeMax: 3, deductFromSolde: false, justificatifRequis: true, limiteCarriere: 1 },
    NAISSANCE: { dureeMax: 3, deductFromSolde: false, justificatifRequis: true, limiteCarriere: null },
    DECES: { dureeMax: 3, deductFromSolde: false, justificatifRequis: true, limiteCarriere: null },
    PELERINAGE: { dureeMax: 30, deductFromSolde: false, justificatifRequis: true, limiteCarriere: 1 },
    SANS_SOLDE: { dureeMax: null, deductFromSolde: false, justificatifRequis: false, limiteCarriere: null },
};
let Conge = class Conge extends mongoose_2.Document {
    employeeId;
    type;
    status;
    startDate;
    endDate;
    dureeDays;
    motif;
    justificatif;
    approvals;
    refusalReason;
    countedInCarrierLimit;
};
exports.Conge = Conge;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conge.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: CongeType }),
    __metadata("design:type", String)
], Conge.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: CongeStatus, default: CongeStatus.EN_ATTENTE }),
    __metadata("design:type", String)
], Conge.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Conge.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Conge.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Conge.prototype, "dureeDays", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Conge.prototype, "motif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Conge.prototype, "justificatif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Conge.prototype, "approvals", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Conge.prototype, "refusalReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Conge.prototype, "countedInCarrierLimit", void 0);
exports.Conge = Conge = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Conge);
exports.CongeSchema = mongoose_1.SchemaFactory.createForClass(Conge);
//# sourceMappingURL=conge.schema.js.map
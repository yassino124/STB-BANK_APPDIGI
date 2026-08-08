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
exports.AbsenceSchema = exports.Absence = exports.AbsenceApprovalStep = exports.AbsenceType = exports.AbsenceStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AbsenceStatus;
(function (AbsenceStatus) {
    AbsenceStatus["PENDING_N1"] = "PENDING_N1";
    AbsenceStatus["APPROVED_N1"] = "APPROVED_N1";
    AbsenceStatus["PENDING_RH"] = "PENDING_RH";
    AbsenceStatus["APPROVED"] = "APPROVED";
    AbsenceStatus["REJECTED"] = "REJECTED";
    AbsenceStatus["CANCELLED"] = "CANCELLED";
})(AbsenceStatus || (exports.AbsenceStatus = AbsenceStatus = {}));
var AbsenceType;
(function (AbsenceType) {
    AbsenceType["ABSENCE"] = "ABSENCE";
    AbsenceType["RETARD"] = "RETARD";
    AbsenceType["DELEGATION"] = "DELEGATION";
    AbsenceType["MISSION"] = "MISSION";
})(AbsenceType || (exports.AbsenceType = AbsenceType = {}));
let AbsenceApprovalStep = class AbsenceApprovalStep {
    approverId;
    approverName;
    level;
    decision;
    date;
    comment;
};
exports.AbsenceApprovalStep = AbsenceApprovalStep;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AbsenceApprovalStep.prototype, "approverId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AbsenceApprovalStep.prototype, "approverName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], AbsenceApprovalStep.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'PENDING' }),
    __metadata("design:type", String)
], AbsenceApprovalStep.prototype, "decision", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AbsenceApprovalStep.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AbsenceApprovalStep.prototype, "comment", void 0);
exports.AbsenceApprovalStep = AbsenceApprovalStep = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AbsenceApprovalStep);
let Absence = class Absence extends mongoose_2.Document {
    employeeId;
    type;
    dateDebut;
    dateFin;
    nombreHeures;
    motif;
    pieceJointe;
    status;
    managerId;
    approvalHistory;
    currentApproverId;
    rhApprovedBy;
    rhApprovedAt;
    rhCommentaire;
    validatedBy;
    validatedAt;
    commentaire;
};
exports.Absence = Absence;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Absence.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AbsenceType, required: true, index: true }),
    __metadata("design:type", String)
], Absence.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Absence.prototype, "dateDebut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Absence.prototype, "dateFin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Absence.prototype, "nombreHeures", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Absence.prototype, "motif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Absence.prototype, "pieceJointe", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AbsenceStatus, default: AbsenceStatus.PENDING_N1, index: true }),
    __metadata("design:type", String)
], Absence.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Absence.prototype, "managerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], Absence.prototype, "approvalHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Absence.prototype, "currentApproverId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Absence.prototype, "rhApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Absence.prototype, "rhApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Absence.prototype, "rhCommentaire", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Absence.prototype, "validatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Absence.prototype, "validatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Absence.prototype, "commentaire", void 0);
exports.Absence = Absence = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Absence);
exports.AbsenceSchema = mongoose_1.SchemaFactory.createForClass(Absence);
exports.AbsenceSchema.index({ employeeId: 1, status: 1 });
exports.AbsenceSchema.index({ managerId: 1, status: 1 });
exports.AbsenceSchema.index({ currentApproverId: 1, status: 1 });
//# sourceMappingURL=absence.schema.js.map
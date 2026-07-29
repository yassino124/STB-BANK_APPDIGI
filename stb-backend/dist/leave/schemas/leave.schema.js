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
exports.LeaveBalanceSchema = exports.LeaveBalance = exports.LeaveRequestSchema = exports.LeaveRequest = exports.LeaveType = exports.LeaveStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING_N1"] = "PENDING_N1";
    LeaveStatus["APPROVED_N1"] = "APPROVED_N1";
    LeaveStatus["PENDING_RH"] = "PENDING_RH";
    LeaveStatus["APPROVED"] = "APPROVED";
    LeaveStatus["REJECTED"] = "REJECTED";
    LeaveStatus["CANCELLED"] = "CANCELLED";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var LeaveType;
(function (LeaveType) {
    LeaveType["REPOS"] = "REPOS";
    LeaveType["MALADIE"] = "MALADIE";
    LeaveType["EXCEPTIONNEL"] = "EXCEPTIONNEL";
    LeaveType["SANS_SOLDE"] = "SANS_SOLDE";
    LeaveType["MATERNITE"] = "MATERNITE";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
let LeaveRequest = class LeaveRequest extends mongoose_2.Document {
    employeeId;
    type;
    dateDebut;
    dateFin;
    nombreJours;
    motif;
    pieceJointe;
    status;
    managerId;
    n1ApprovedBy;
    n1ApprovedAt;
    n1Commentaire;
    rhApprovedBy;
    rhApprovedAt;
    rhCommentaire;
    validatedBy;
    validatedAt;
    commentaire;
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeaveRequest.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: LeaveType, default: LeaveType.REPOS }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "dateDebut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "dateFin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "nombreJours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "motif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "pieceJointe", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: LeaveStatus, default: LeaveStatus.PENDING_N1 }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeaveRequest.prototype, "managerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeaveRequest.prototype, "n1ApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "n1ApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "n1Commentaire", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeaveRequest.prototype, "rhApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "rhApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "rhCommentaire", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeaveRequest.prototype, "validatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "validatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "commentaire", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LeaveRequest);
exports.LeaveRequestSchema = mongoose_1.SchemaFactory.createForClass(LeaveRequest);
exports.LeaveRequestSchema.index({ employeeId: 1, status: 1 });
exports.LeaveRequestSchema.index({ managerId: 1, status: 1 });
let LeaveBalance = class LeaveBalance extends mongoose_2.Document {
    employeeId;
    soldeAnnuel;
    soldeUtilise;
    soldeReporte;
    get soldeDisponible() { return this.soldeAnnuel - this.soldeUtilise + this.soldeReporte; }
    annee;
};
exports.LeaveBalance = LeaveBalance;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee', unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LeaveBalance.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 90 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "soldeAnnuel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "soldeUtilise", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "soldeReporte", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: new Date().getFullYear() }),
    __metadata("design:type", Number)
], LeaveBalance.prototype, "annee", void 0);
exports.LeaveBalance = LeaveBalance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LeaveBalance);
exports.LeaveBalanceSchema = mongoose_1.SchemaFactory.createForClass(LeaveBalance);
//# sourceMappingURL=leave.schema.js.map
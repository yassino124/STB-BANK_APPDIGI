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
exports.PayrollSchema = exports.Payroll = exports.PayrollStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PayrollStatus;
(function (PayrollStatus) {
    PayrollStatus["DRAFT"] = "DRAFT";
    PayrollStatus["VALIDATED"] = "VALIDATED";
    PayrollStatus["PAID"] = "PAID";
})(PayrollStatus || (exports.PayrollStatus = PayrollStatus = {}));
let Payroll = class Payroll extends mongoose_2.Document {
    employeeId;
    mois;
    annee;
    salaireBrut;
    cnss;
    impot;
    prime;
    heuresSup;
    retenues;
    salaireNet;
    status;
};
exports.Payroll = Payroll;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payroll.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "mois", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "annee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "salaireBrut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "cnss", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "impot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "prime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "heuresSup", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "retenues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "salaireNet", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: PayrollStatus, default: PayrollStatus.DRAFT }),
    __metadata("design:type", String)
], Payroll.prototype, "status", void 0);
exports.Payroll = Payroll = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Payroll);
exports.PayrollSchema = mongoose_1.SchemaFactory.createForClass(Payroll);
exports.PayrollSchema.index({ employeeId: 1, mois: 1, annee: 1 }, { unique: true });
//# sourceMappingURL=payroll.schema.js.map
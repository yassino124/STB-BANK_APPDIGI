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
exports.ReportSchema = exports.Report = exports.ReportStatus = exports.ReportFormat = exports.ReportType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ReportType;
(function (ReportType) {
    ReportType["EMPLOYEE"] = "EMPLOYEE";
    ReportType["FINANCIAL"] = "FINANCIAL";
    ReportType["PAYROLL"] = "PAYROLL";
    ReportType["LEAVE"] = "LEAVE";
    ReportType["CREDIT"] = "CREDIT";
    ReportType["AUDIT"] = "AUDIT";
    ReportType["CUSTOM"] = "CUSTOM";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "PDF";
    ReportFormat["EXCEL"] = "EXCEL";
    ReportFormat["CSV"] = "CSV";
    ReportFormat["JSON"] = "JSON";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["GENERATING"] = "GENERATING";
    ReportStatus["COMPLETED"] = "COMPLETED";
    ReportStatus["FAILED"] = "FAILED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
let Report = class Report {
    name;
    type;
    format;
    parameters;
    generatedBy;
    fileUrl;
    fileSize;
    status;
    expiresAt;
    completedAt;
};
exports.Report = Report;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Report.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ReportType, index: true }),
    __metadata("design:type", String)
], Report.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ReportFormat, index: true }),
    __metadata("design:type", String)
], Report.prototype, "format", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Report.prototype, "parameters", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Report.prototype, "generatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Report.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Report.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ReportStatus, default: ReportStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null, index: true }),
    __metadata("design:type", Object)
], Report.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Report.prototype, "completedAt", void 0);
exports.Report = Report = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reports' })
], Report);
exports.ReportSchema = mongoose_1.SchemaFactory.createForClass(Report);
exports.ReportSchema.index({ type: 1, status: 1 });
exports.ReportSchema.index({ generatedBy: 1, createdAt: -1 });
//# sourceMappingURL=report.schema.js.map
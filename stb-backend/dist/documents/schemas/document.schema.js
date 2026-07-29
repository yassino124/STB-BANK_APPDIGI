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
exports.EmployeeDocumentSchema = exports.EmployeeDocument = exports.DocumentType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var DocumentType;
(function (DocumentType) {
    DocumentType["PAYSLIP"] = "PAYSLIP";
    DocumentType["WORK_CERTIFICATE"] = "WORK_CERTIFICATE";
    DocumentType["SALARY_CERTIFICATE"] = "SALARY_CERTIFICATE";
    DocumentType["TAX_DECLARATION"] = "TAX_DECLARATION";
    DocumentType["CNSS_DECLARATION"] = "CNSS_DECLARATION";
    DocumentType["CONTRACT"] = "CONTRACT";
    DocumentType["ID_DOCUMENT"] = "ID_DOCUMENT";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
let EmployeeDocument = class EmployeeDocument {
    employeeId;
    title;
    type;
    fileUrl;
    fileName;
    fileSize;
    mimeType;
    description;
    uploadedBy;
    isRead;
    year;
    month;
    isActive;
};
exports.EmployeeDocument = EmployeeDocument;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EmployeeDocument.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: DocumentType, index: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'application/pdf' }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EmployeeDocument.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "month", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isActive", void 0);
exports.EmployeeDocument = EmployeeDocument = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'documents' })
], EmployeeDocument);
exports.EmployeeDocumentSchema = mongoose_1.SchemaFactory.createForClass(EmployeeDocument);
exports.EmployeeDocumentSchema.index({ employeeId: 1, type: 1 });
exports.EmployeeDocumentSchema.index({ employeeId: 1, year: 1, month: 1 });
//# sourceMappingURL=document.schema.js.map
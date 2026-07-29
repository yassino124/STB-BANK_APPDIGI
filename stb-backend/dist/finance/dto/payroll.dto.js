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
exports.UpdatePayrollStatusDto = exports.CreatePayrollDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const payroll_schema_1 = require("../schemas/payroll.schema");
class CreatePayrollDto {
    employeeId;
    month;
    year;
    salaireBase;
    prime;
    avancesDeduites;
    creditsDeduits;
    impot;
    securiteSociale;
}
exports.CreatePayrollDto = CreatePayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "salaireBase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "prime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "avancesDeduites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "creditsDeduits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "impot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "securiteSociale", void 0);
class UpdatePayrollStatusDto {
    status;
    commentaire;
}
exports.UpdatePayrollStatusDto = UpdatePayrollStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: payroll_schema_1.PayrollStatus }),
    __metadata("design:type", String)
], UpdatePayrollStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], UpdatePayrollStatusDto.prototype, "commentaire", void 0);
//# sourceMappingURL=payroll.dto.js.map
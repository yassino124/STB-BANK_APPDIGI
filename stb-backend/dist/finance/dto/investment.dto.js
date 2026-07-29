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
exports.UpdateInvestmentStatusDto = exports.CreateInvestmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const investment_schema_1 = require("../schemas/investment.schema");
class CreateInvestmentDto {
    employeeId;
    name;
    amount;
    expectedReturn;
    commentaire;
}
exports.CreateInvestmentDto = CreateInvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "expectedReturn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "commentaire", void 0);
class UpdateInvestmentStatusDto {
    status;
    commentaire;
}
exports.UpdateInvestmentStatusDto = UpdateInvestmentStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: investment_schema_1.InvestmentStatus }),
    __metadata("design:type", String)
], UpdateInvestmentStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], UpdateInvestmentStatusDto.prototype, "commentaire", void 0);
//# sourceMappingURL=investment.dto.js.map
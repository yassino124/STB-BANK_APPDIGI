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
exports.CreateAbsenceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const absence_schema_1 = require("../schemas/absence.schema");
class CreateAbsenceDto {
    type;
    dateDebut;
    dateFin;
    nombreHeures;
    motif;
    pieceJointe;
}
exports.CreateAbsenceDto = CreateAbsenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: absence_schema_1.AbsenceType }),
    __metadata("design:type", String)
], CreateAbsenceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CreateAbsenceDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CreateAbsenceDto.prototype, "dateFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateAbsenceDto.prototype, "nombreHeures", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], CreateAbsenceDto.prototype, "motif", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], CreateAbsenceDto.prototype, "pieceJointe", void 0);
//# sourceMappingURL=create-absence.dto.js.map
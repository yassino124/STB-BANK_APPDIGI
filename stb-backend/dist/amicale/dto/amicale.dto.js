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
exports.UpdateAmicaleOfferDto = exports.CreateAmicaleOfferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAmicaleOfferDto {
    title;
    sub;
    cat;
    img;
    price;
    color;
    desc;
}
exports.CreateAmicaleOfferDto = CreateAmicaleOfferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Paris 5 Jours', description: 'Titre principal de l\'offre' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Escapade romantique', description: 'Sous-titre ou lieu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "sub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Voyages', description: 'Catégorie (Voyages, Hôtels, Bien-être, Achats)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "cat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'data:image/jpeg;base64,...', description: 'Image base64 ou URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "img", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1250 TND', description: 'Tarif STB (texte libre)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#7C3AED', description: 'Couleur du badge (HEX)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Profitez d\'un séjour inoubliable à Paris...', description: 'Description complète' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAmicaleOfferDto.prototype, "desc", void 0);
class UpdateAmicaleOfferDto {
    title;
    sub;
    cat;
    img;
    price;
    color;
    desc;
    isActive;
}
exports.UpdateAmicaleOfferDto = UpdateAmicaleOfferDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "sub", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "cat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "img", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAmicaleOfferDto.prototype, "desc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAmicaleOfferDto.prototype, "isActive", void 0);
//# sourceMappingURL=amicale.dto.js.map
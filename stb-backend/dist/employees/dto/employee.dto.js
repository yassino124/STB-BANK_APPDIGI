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
exports.UpdateEmployeeAvatarDto = exports.UpdateEmployeeStatusDto = exports.UpdateEmployeeRolesDto = exports.UpdateEmployeeFinancialsDto = exports.CreateEmployeeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const role_enum_1 = require("../../common/enums/role.enum");
const employee_status_enum_1 = require("../../common/enums/employee-status.enum");
class CreateEmployeeDto {
    matricule;
    cin;
    dateNaissance;
    nom;
    prenom;
    email;
    phone;
    roles;
    poste;
    departement;
    agence;
    soldeConges;
    creditsEnCours;
    salaireBase;
    compteSolde;
    prime;
    avatar;
    managerId;
    departmentId;
    branchId;
    service;
    direction;
    directorId;
    centralDirectorId;
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'EMP001234', description: 'Matricule (auto-generated if empty)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678', description: 'Numéro CIN' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "cin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1990-05-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "dateNaissance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ben Ali' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mohamed' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ahmed.benali@stb.com.tn' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+21698765432' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: role_enum_1.Role, isArray: true, default: [role_enum_1.Role.EMPLOYEE] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role, { each: true }),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Analyste Crédit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "poste", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Direction des Risques' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "departement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Agence Tunis Centre' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "agence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "soldeConges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "creditsEnCours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2500, description: 'Salaire de base en TND' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "salaireBase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5000, description: 'Solde initial du compte (TND)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "compteSolde", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 200, description: 'Prime mensuelle en TND' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "prime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.png', description: 'URL de la photo de profil' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011', description: 'ID du manager (N+1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439012', description: 'ID du département' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439013', description: 'ID de l\'agence' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Développement' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "service", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Direction Informatique' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439014', description: 'ID du directeur (N+2)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "directorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439015', description: 'ID du directeur central (N+3)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "centralDirectorId", void 0);
class UpdateEmployeeFinancialsDto {
    soldeConges;
    creditsEnCours;
    avancesEnCours;
    prime;
    salaireBase;
    compteSolde;
}
exports.UpdateEmployeeFinancialsDto = UpdateEmployeeFinancialsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeFinancialsDto.prototype, "soldeConges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeFinancialsDto.prototype, "creditsEnCours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeFinancialsDto.prototype, "avancesEnCours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeFinancialsDto.prototype, "prime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2500, description: 'Salaire de base en TND' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeFinancialsDto.prototype, "salaireBase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5000, description: 'Solde actuel du compte (TND)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeFinancialsDto.prototype, "compteSolde", void 0);
class UpdateEmployeeRolesDto {
    roles;
}
exports.UpdateEmployeeRolesDto = UpdateEmployeeRolesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: role_enum_1.Role, isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role, { each: true }),
    __metadata("design:type", Array)
], UpdateEmployeeRolesDto.prototype, "roles", void 0);
class UpdateEmployeeStatusDto {
    status;
}
exports.UpdateEmployeeStatusDto = UpdateEmployeeStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: employee_status_enum_1.EmployeeStatus }),
    (0, class_validator_1.IsEnum)(employee_status_enum_1.EmployeeStatus),
    __metadata("design:type", String)
], UpdateEmployeeStatusDto.prototype, "status", void 0);
class UpdateEmployeeAvatarDto {
    avatar;
}
exports.UpdateEmployeeAvatarDto = UpdateEmployeeAvatarDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'data:image/jpeg;base64,...', description: 'Base64 image string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateEmployeeAvatarDto.prototype, "avatar", void 0);
//# sourceMappingURL=employee.dto.js.map
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
exports.ChangeDeviceDto = exports.EnableBiometricsDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshTokenDto = exports.PinLoginDto = exports.BiometricLoginDto = exports.LoginDto = exports.CreatePinDto = exports.CreatePasswordDto = exports.VerifyOtpDto = exports.ActivateRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ActivateRequestDto {
    matricule;
    cin;
    dateNaissance;
}
exports.ActivateRequestDto = ActivateRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234', description: 'Matricule de l\'employé' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActivateRequestDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678', description: 'Numéro CIN' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActivateRequestDto.prototype, "cin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1990-05-15', description: 'Date de naissance (ISO)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ActivateRequestDto.prototype, "dateNaissance", void 0);
class VerifyOtpDto {
    matricule;
    code;
    purpose;
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '482931', description: 'Code OTP 6 chiffres' }),
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVATION', enum: ['ACTIVATION', 'PASSWORD_RESET', 'DEVICE_CHANGE'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "purpose", void 0);
class CreatePasswordDto {
    matricule;
    password;
}
exports.CreatePasswordDto = CreatePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePasswordDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MyStr@ng2024!', description: 'Mot de passe (8+ chars, majuscule, chiffre, symbole)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(8, 100),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole',
    }),
    __metadata("design:type", String)
], CreatePasswordDto.prototype, "password", void 0);
class CreatePinDto {
    matricule;
    pin;
}
exports.CreatePinDto = CreatePinDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePinDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '458936', description: 'PIN 6 chiffres' }),
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.Length)(6, 6, { message: 'Le PIN doit contenir exactement 6 chiffres' }),
    __metadata("design:type", String)
], CreatePinDto.prototype, "pin", void 0);
class LoginDto {
    matricule;
    password;
    deviceUUID;
    deviceName;
    platform;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234', description: 'Matricule ou Employee ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MyStr@ng2024!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Device UUID for trusted device recognition' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "deviceUUID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'iPhone 16 Pro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "deviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'iOS', enum: ['iOS', 'Android', 'Web'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "platform", void 0);
class BiometricLoginDto {
    deviceUUID;
    matricule;
    biometricType;
}
exports.BiometricLoginDto = BiometricLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device UUID of trusted device' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BiometricLoginDto.prototype, "deviceUUID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BiometricLoginDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FACE_ID', 'FINGERPRINT', 'PIN'], description: 'Type of biometric used' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BiometricLoginDto.prototype, "biometricType", void 0);
class PinLoginDto {
    matricule;
    pin;
    deviceUUID;
}
exports.PinLoginDto = PinLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PinLoginDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '458936' }),
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], PinLoginDto.prototype, "pin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PinLoginDto.prototype, "deviceUUID", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JWT Refresh Token' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class ForgotPasswordDto {
    matricule;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "matricule", void 0);
class ResetPasswordDto {
    matricule;
    otpCode;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '482931' }),
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NewStr@ng2024!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(8, 100),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole',
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class EnableBiometricsDto {
    type;
    deviceUUID;
}
exports.EnableBiometricsDto = EnableBiometricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FACE_ID', 'FINGERPRINT', 'BOTH'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnableBiometricsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnableBiometricsDto.prototype, "deviceUUID", void 0);
class ChangeDeviceDto {
    matricule;
    newDeviceUUID;
    newDeviceName;
    otpCode;
}
exports.ChangeDeviceDto = ChangeDeviceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangeDeviceDto.prototype, "matricule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangeDeviceDto.prototype, "newDeviceUUID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Samsung Galaxy S25' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeDeviceDto.prototype, "newDeviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '482931' }),
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], ChangeDeviceDto.prototype, "otpCode", void 0);
//# sourceMappingURL=auth.dto.js.map
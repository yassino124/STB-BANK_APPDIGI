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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const employees_service_1 = require("../employees/employees.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    authService;
    employeesService;
    constructor(authService, employeesService) {
        this.authService = authService;
        this.employeesService = employeesService;
    }
    async requestActivation(dto, req) {
        return this.authService.requestActivation(dto);
    }
    async verifyOtp(dto) {
        return this.authService.verifyOtp(dto);
    }
    async createPassword(employeeId, dto) {
        return this.authService.createPassword(employeeId, dto);
    }
    async createPin(employeeId, dto) {
        return this.authService.createPin(employeeId, dto);
    }
    async enableBiometrics(employeeId, dto) {
        return this.authService.enableBiometrics(employeeId, dto);
    }
    async login(dto, req) {
        const ip = req.ip || req.socket?.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.authService.login(dto, ip, userAgent);
    }
    async loginWeb(dto, req) {
        const ip = req.ip || req.socket?.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.authService.loginWeb(dto, ip, userAgent);
    }
    async biometricLogin(dto, req) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.authService.biometricLogin(dto, ip, userAgent);
    }
    async pinLogin(dto, req) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.authService.pinLogin(dto, ip, userAgent);
    }
    async refreshToken(dto) {
        return this.authService.refreshToken(dto);
    }
    async logout(employeeId, authHeader) {
        const token = authHeader?.replace('Bearer ', '');
        return this.authService.logout(employeeId, token);
    }
    async forgotPassword(dto) {
        return this.authService.forgotPassword(dto);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword(dto);
    }
    async changeDevice(dto) {
        return this.authService.changeDevice(dto);
    }
    async me(user) {
        const employee = await this.employeesService.findOne(user.sub);
        return employee;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('activate/request'),
    (0, swagger_1.ApiOperation)({
        summary: '🟢 Step 1 — Request account activation',
        description: 'Employee provides Matricule + CIN + Date of Birth. Backend sends OTP to their STB email.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent to employee email' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employee not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Account already activated' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ActivateRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestActivation", null);
__decorate([
    (0, common_1.Post)('activate/verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🟢 Step 2 — Verify OTP code',
        description: 'Verify the 6-digit OTP code. Returns a setup token for next steps.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('activate/set-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🟢 Step 3 — Create password',
        description: 'Employee creates their secure password (8+ chars, uppercase, number, symbol required).',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.CreatePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createPassword", null);
__decorate([
    (0, common_1.Post)('activate/set-pin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🟢 Step 4 — Create 6-digit PIN',
        description: 'Employee creates a 6-digit PIN for offline/biometric fallback authentication.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.CreatePinDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createPin", null);
__decorate([
    (0, common_1.Post)('activate/enable-biometrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🟢 Step 5 — Enable Face ID / Fingerprint (completes activation)',
        description: 'Final activation step. Enables biometrics and marks account as ACTIVE.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.EnableBiometricsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableBiometrics", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔑 Login with Matricule + Password',
        description: 'Returns JWT access token (15min) + refresh token (30 days). Include device UUID for trusted device management.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Account locked or suspended' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login/web'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🖥️ Web Dashboard Login — RH / Admin only',
        description: 'Dedicated login for the RH web dashboard. Accepts any RH/ADMIN account regardless of mobile activation status.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied — RH/Admin only' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWeb", null);
__decorate([
    (0, common_1.Post)('login/biometric'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '👁️ Login with Face ID / Fingerprint',
        description: 'Fast authentication for trusted devices with biometrics enabled. No password needed.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.BiometricLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "biometricLogin", null);
__decorate([
    (0, common_1.Post)('login/pin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔢 Login with PIN (biometric fallback)',
        description: 'Fallback authentication using 6-digit PIN when biometrics fail.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PinLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "pinLogin", null);
__decorate([
    (0, common_1.Post)('token/refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 Refresh access token',
        description: 'Exchange an expired access token for a new one using the refresh token. Token rotation is applied.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🚪 Logout (revoke current session)',
        description: 'Revokes the current access token/session. Biometrics remain enabled.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('password/forgot'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔓 Forgot password — request OTP',
        description: 'Sends a password reset OTP to the employee\'s STB email.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('password/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔓 Reset password with OTP',
        description: 'Resets password using OTP code. All active sessions are revoked.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('device/change'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📱 Change trusted device',
        description: 'Register a new device and revoke trust from all old devices. Requires OTP verification.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ChangeDeviceDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeDevice", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '👤 Get current authenticated employee (full profile)',
        description: 'Returns the full employee document from the database.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('🔐 Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        employees_service_1.EmployeesService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
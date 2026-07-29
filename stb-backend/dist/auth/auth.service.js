"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const employee_schema_1 = require("../employees/employee.schema");
const role_enum_1 = require("../common/enums/role.enum");
const device_schema_1 = require("../devices/device.schema");
const session_schema_1 = require("../sessions/session.schema");
const otp_service_1 = require("../otp/otp.service");
const otp_schema_1 = require("../otp/otp.schema");
const audit_service_1 = require("../audit/audit.service");
const audit_action_enum_1 = require("../common/enums/audit-action.enum");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
let AuthService = AuthService_1 = class AuthService {
    employeeModel;
    deviceModel;
    sessionModel;
    jwtService;
    configService;
    otpService;
    auditService;
    logger = new common_1.Logger(AuthService_1.name);
    SALT_ROUNDS = 12;
    MAX_LOGIN_ATTEMPTS = 5;
    LOCK_DURATION_MINUTES = 30;
    constructor(employeeModel, deviceModel, sessionModel, jwtService, configService, otpService, auditService) {
        this.employeeModel = employeeModel;
        this.deviceModel = deviceModel;
        this.sessionModel = sessionModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.otpService = otpService;
        this.auditService = auditService;
    }
    async requestActivation(dto) {
        const employee = await this.employeeModel
            .findOne({
            matricule: dto.matricule.toUpperCase(),
            cin: dto.cin.toUpperCase(),
        })
            .exec();
        if (!employee) {
            throw new common_1.NotFoundException('Employé introuvable. Vérifiez votre matricule et CIN.');
        }
        if (employee.isActivated) {
            throw new common_1.BadRequestException('Ce compte est déjà activé.');
        }
        const dob = new Date(dto.dateNaissance);
        const empDob = new Date(employee.dateNaissance);
        if (dob.toDateString() !== empDob.toDateString()) {
            throw new common_1.UnauthorizedException('Date de naissance incorrecte.');
        }
        const result = await this.otpService.sendOtp(employee._id.toString(), otp_schema_1.OtpPurpose.ACTIVATION, employee.email, employee.phone);
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.OTP_SENT, true, {
            metadata: { purpose: otp_schema_1.OtpPurpose.ACTIVATION },
        });
        return result;
    }
    async verifyOtp(dto) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        const purpose = dto.purpose;
        const isValid = await this.otpService.verifyOtp(employee._id.toString(), purpose, dto.code);
        if (!isValid) {
            await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.OTP_FAILED, false);
            throw new common_1.UnauthorizedException('Code OTP invalide ou expiré.');
        }
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.OTP_VERIFIED, true);
        const setupToken = this.jwtService.sign({ sub: employee._id.toString(), matricule: employee.matricule, purpose, step: 'otp_verified' }, { expiresIn: '15m' });
        return { verified: true, token: setupToken };
    }
    async createPassword(employeeId, dto) {
        const employee = await this.employeeModel
            .findById(employeeId)
            .select('+passwordHash')
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        await this.employeeModel.updateOne({ _id: employee._id }, { passwordHash, passwordChangedAt: new Date() });
        return { message: 'Mot de passe créé avec succès.' };
    }
    async createPin(employeeId, dto) {
        const employee = await this.employeeModel
            .findById(employeeId)
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        const pinHash = await bcrypt.hash(dto.pin, this.SALT_ROUNDS);
        await this.employeeModel.updateOne({ _id: employee._id }, { pinHash });
        return { message: 'PIN créé avec succès.' };
    }
    async enableBiometrics(employeeId, dto) {
        const update = {};
        if (dto.type === 'FACE_ID' || dto.type === 'BOTH')
            update.faceEnabled = true;
        if (dto.type === 'FINGERPRINT' || dto.type === 'BOTH')
            update.fingerEnabled = true;
        update.isActivated = true;
        update.status = employee_status_enum_1.EmployeeStatus.ACTIVE;
        await this.employeeModel.updateOne({ _id: employeeId }, update);
        await this.deviceModel.updateOne({ deviceUUID: dto.deviceUUID, employeeId: new mongoose_2.Types.ObjectId(employeeId) }, { trusted: true, biometricsEnabled: true }, { upsert: false });
        await this.auditService.log(employeeId, audit_action_enum_1.AuditAction.BIOMETRICS_ENABLED, true, {
            metadata: { type: dto.type },
        });
        await this.auditService.log(employeeId, audit_action_enum_1.AuditAction.ACCOUNT_ACTIVATED, true);
        return { message: 'Biométrie activée. Compte entièrement activé. Bienvenue dans STB Mobile !' };
    }
    async login(dto, ip, userAgent) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .select('+passwordHash')
            .exec();
        if (!employee) {
            throw new common_1.UnauthorizedException('Matricule ou mot de passe incorrect.');
        }
        if (!employee.isActivated) {
            throw new common_1.ForbiddenException('Compte non activé. Contactez les RH.');
        }
        if (employee.status === employee_status_enum_1.EmployeeStatus.SUSPENDED) {
            throw new common_1.ForbiddenException('Compte suspendu. Contactez les RH.');
        }
        if (employee.lockedUntil && employee.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((employee.lockedUntil.getTime() - Date.now()) / 60000);
            throw new common_1.ForbiddenException(`Compte verrouillé. Réessayez dans ${minutesLeft} minute(s).`);
        }
        if (!employee.passwordHash) {
            throw new common_1.BadRequestException('Mot de passe non défini. Activez votre compte d\'abord.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, employee.passwordHash);
        if (!isPasswordValid) {
            await this.handleFailedLogin(employee);
            await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.LOGIN_FAILED, false, {
                ip,
                userAgent,
                metadata: { matricule: dto.matricule },
            });
            throw new common_1.UnauthorizedException('Matricule ou mot de passe incorrect.');
        }
        await this.employeeModel.updateOne({ _id: employee._id }, { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() });
        let isNewDevice = false;
        let requiresDeviceVerification = false;
        let deviceDoc = null;
        if (dto.deviceUUID) {
            deviceDoc = await this.deviceModel.findOne({ deviceUUID: dto.deviceUUID }).exec();
            if (!deviceDoc) {
                isNewDevice = true;
                requiresDeviceVerification = true;
                deviceDoc = await this.deviceModel.create({
                    employeeId: employee._id,
                    deviceUUID: dto.deviceUUID,
                    deviceName: dto.deviceName || 'Unknown Device',
                    platform: dto.platform || device_schema_1.Platform.IOS,
                    trusted: false,
                    lastLoginAt: new Date(),
                    lastLoginIp: ip,
                    loginCount: 1,
                });
            }
            else {
                await this.deviceModel.updateOne({ _id: deviceDoc._id }, { lastLoginAt: new Date(), lastLoginIp: ip, $inc: { loginCount: 1 } });
            }
        }
        const tokens = await this.generateTokens(employee);
        await this.createSession(employee._id.toString(), tokens, deviceDoc?._id?.toString() || null, ip, userAgent);
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.LOGIN, true, {
            ip,
            userAgent,
            deviceUUID: dto.deviceUUID,
            metadata: { isNewDevice },
        });
        const { passwordHash, pinHash, ...safeEmployee } = employee.toObject();
        return {
            ...tokens,
            employee: safeEmployee,
            isNewDevice,
            requiresDeviceVerification,
        };
    }
    async loginWeb(dto, ip, userAgent) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .select('+passwordHash')
            .exec();
        if (!employee) {
            throw new common_1.UnauthorizedException('Matricule ou mot de passe incorrect.');
        }
        const allowedRoles = [role_enum_1.Role.RH, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN, role_enum_1.Role.FINANCE, role_enum_1.Role.AGENCE, role_enum_1.Role.MANAGER];
        const hasAccess = employee.roles.some((r) => allowedRoles.includes(r));
        if (!hasAccess) {
            throw new common_1.ForbiddenException("Accès refusé. Réservé aux ressources humaines et administrateurs.");
        }
        if (employee.status === employee_status_enum_1.EmployeeStatus.SUSPENDED) {
            throw new common_1.ForbiddenException('Compte suspendu. Contactez le service informatique.');
        }
        if (employee.lockedUntil && employee.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((employee.lockedUntil.getTime() - Date.now()) / 60000);
            throw new common_1.ForbiddenException(`Compte verrouillé. Réessayez dans ${minutesLeft} minute(s).`);
        }
        if (!employee.passwordHash) {
            throw new common_1.BadRequestException('Mot de passe non défini. Demandez à un administrateur de configurer votre accès.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, employee.passwordHash);
        if (!isPasswordValid) {
            await this.handleFailedLogin(employee);
            await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.LOGIN_FAILED, false, {
                ip,
                userAgent,
                metadata: { matricule: dto.matricule, channel: 'WEB_DASHBOARD' },
            });
            throw new common_1.UnauthorizedException('Matricule ou mot de passe incorrect.');
        }
        await this.employeeModel.updateOne({ _id: employee._id }, {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            isActivated: true,
            status: employee_status_enum_1.EmployeeStatus.ACTIVE,
        });
        const tokens = await this.generateTokens(employee);
        await this.createSession(employee._id.toString(), tokens, null, ip, userAgent);
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.LOGIN, true, {
            ip,
            userAgent,
            metadata: { channel: 'WEB_DASHBOARD' },
        });
        const { passwordHash, pinHash, ...safeEmployee } = employee.toObject();
        return {
            ...tokens,
            employee: safeEmployee,
        };
    }
    async biometricLogin(dto, ip, userAgent) {
        const device = await this.deviceModel
            .findOne({ deviceUUID: dto.deviceUUID, trusted: true })
            .exec();
        if (!device) {
            throw new common_1.UnauthorizedException('Appareil non reconnu ou non approuvé.');
        }
        if (!device.biometricsEnabled) {
            throw new common_1.ForbiddenException('La biométrie n\'est pas activée sur cet appareil.');
        }
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .exec();
        if (!employee || !employee.isActivated) {
            throw new common_1.UnauthorizedException('Employé introuvable ou compte non activé.');
        }
        if (device.employeeId.toString() !== employee._id.toString()) {
            throw new common_1.ForbiddenException('Appareil non associé à ce compte.');
        }
        const tokens = await this.generateTokens(employee);
        await this.createSession(employee._id.toString(), tokens, device._id?.toString(), ip, userAgent);
        const auditAction = dto.biometricType === 'FACE_ID'
            ? audit_action_enum_1.AuditAction.FACE_ID_SUCCESS
            : audit_action_enum_1.AuditAction.FINGERPRINT_SUCCESS;
        await this.auditService.log(employee._id.toString(), auditAction, true, {
            ip,
            userAgent,
            deviceUUID: dto.deviceUUID,
        });
        await this.employeeModel.updateOne({ _id: employee._id }, { lastLoginAt: new Date() });
        return { ...tokens, employee: { matricule: employee.matricule, nom: employee.nom, prenom: employee.prenom, roles: employee.roles } };
    }
    async pinLogin(dto, ip, userAgent) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .select('+pinHash')
            .exec();
        if (!employee || !employee.isActivated) {
            throw new common_1.UnauthorizedException('Employé introuvable ou compte non activé.');
        }
        if (!employee.pinHash) {
            throw new common_1.BadRequestException('PIN non défini. Configurez votre PIN d\'abord.');
        }
        const isPinValid = await bcrypt.compare(dto.pin, employee.pinHash);
        if (!isPinValid) {
            await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.PIN_FAILED, false, { ip });
            throw new common_1.UnauthorizedException('PIN incorrect.');
        }
        const tokens = await this.generateTokens(employee);
        const deviceDoc = dto.deviceUUID
            ? await this.deviceModel.findOne({ deviceUUID: dto.deviceUUID }).exec()
            : null;
        await this.createSession(employee._id.toString(), tokens, deviceDoc?._id?.toString() || null, ip, userAgent);
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.PIN_SUCCESS, true, { ip });
        await this.employeeModel.updateOne({ _id: employee._id }, { lastLoginAt: new Date() });
        return tokens;
    }
    async refreshToken(dto) {
        const session = await this.sessionModel
            .findOne({
            refreshToken: dto.refreshToken,
            isRevoked: false,
            refreshTokenExpiresAt: { $gt: new Date() },
        })
            .exec();
        if (!session) {
            throw new common_1.UnauthorizedException('Refresh token invalide ou expiré.');
        }
        const employee = await this.employeeModel.findById(session.employeeId).exec();
        if (!employee || !employee.isActivated) {
            throw new common_1.UnauthorizedException('Compte non valide.');
        }
        await this.sessionModel.updateOne({ _id: session._id }, { isRevoked: true, revokedAt: new Date() });
        const tokens = await this.generateTokens(employee);
        await this.createSession(employee._id.toString(), tokens, session.deviceId?.toString() || null, session.ip ?? undefined, session.userAgent ?? undefined);
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.TOKEN_REFRESHED, true);
        return tokens;
    }
    async forgotPassword(dto) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .exec();
        if (!employee) {
            return { message: 'Si ce matricule existe, un OTP a été envoyé à l\'email associé.' };
        }
        const result = await this.otpService.sendOtp(employee._id.toString(), otp_schema_1.OtpPurpose.PASSWORD_RESET, employee.email);
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.OTP_SENT, true, {
            metadata: { purpose: otp_schema_1.OtpPurpose.PASSWORD_RESET },
        });
        return result;
    }
    async resetPassword(dto) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        const isValid = await this.otpService.verifyOtp(employee._id.toString(), otp_schema_1.OtpPurpose.PASSWORD_RESET, dto.otpCode);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Code OTP invalide ou expiré.');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
        await this.employeeModel.updateOne({ _id: employee._id }, { passwordHash, passwordChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null });
        await this.sessionModel.updateMany({ employeeId: employee._id, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.PASSWORD_RESET, true);
        return { message: 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.' };
    }
    async logout(employeeId, accessToken) {
        await this.sessionModel.updateOne({ accessToken, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
        await this.auditService.log(employeeId, audit_action_enum_1.AuditAction.LOGOUT, true);
        return { message: 'Déconnexion réussie.' };
    }
    async changeDevice(dto) {
        const employee = await this.employeeModel
            .findOne({ matricule: dto.matricule.toUpperCase() })
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        const isValid = await this.otpService.verifyOtp(employee._id.toString(), otp_schema_1.OtpPurpose.DEVICE_CHANGE, dto.otpCode);
        if (!isValid)
            throw new common_1.UnauthorizedException('Code OTP invalide ou expiré.');
        await this.deviceModel.updateMany({ employeeId: employee._id, trusted: true }, { trusted: false });
        await this.deviceModel.create({
            employeeId: employee._id,
            deviceUUID: dto.newDeviceUUID,
            deviceName: dto.newDeviceName,
            trusted: true,
            lastLoginAt: new Date(),
        });
        await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.DEVICE_TRUSTED, true, {
            metadata: { newDevice: dto.newDeviceName },
        });
        return { message: 'Nouvel appareil approuvé avec succès.' };
    }
    async generateTokens(employee) {
        const payload = {
            sub: employee._id.toString(),
            matricule: employee.matricule,
            roles: employee.roles,
            jti: `${employee._id.toString()}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '30d'),
        });
        return { accessToken, refreshToken };
    }
    async createSession(employeeId, tokens, deviceId, ip, userAgent) {
        const accessExpiresAt = new Date(Date.now() + this.parseExpiry(this.configService.get('JWT_ACCESS_EXPIRES', '15m')));
        const refreshExpiresAt = new Date(Date.now() + this.parseExpiry(this.configService.get('JWT_REFRESH_EXPIRES', '30d')));
        const create = async (tokensToUse) => {
            await this.sessionModel.create({
                employeeId: new mongoose_2.Types.ObjectId(employeeId),
                deviceId: deviceId ? new mongoose_2.Types.ObjectId(deviceId) : null,
                accessToken: tokensToUse.accessToken,
                refreshToken: tokensToUse.refreshToken,
                accessTokenExpiresAt: accessExpiresAt,
                refreshTokenExpiresAt: refreshExpiresAt,
                ip: ip || null,
                userAgent: userAgent || null,
            });
        };
        try {
            await create(tokens);
        }
        catch (e) {
            if (e?.code === 11000 && e?.keyPattern?.accessToken) {
                const emp = await this.employeeModel.findById(employeeId).exec();
                if (!emp)
                    throw e;
                const newTokens = await this.generateTokens(emp);
                await create(newTokens);
            }
            else {
                throw e;
            }
        }
    }
    parseExpiry(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 15 * 60 * 1000;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return value * (multipliers[unit] || 60 * 1000);
    }
    async handleFailedLogin(employee) {
        const attempts = employee.failedLoginAttempts + 1;
        const update = { failedLoginAttempts: attempts };
        if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
            update.lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000);
            await this.auditService.log(employee._id.toString(), audit_action_enum_1.AuditAction.ACCOUNT_LOCKED, false, { metadata: { attempts } });
        }
        await this.employeeModel.updateOne({ _id: employee._id }, update);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __param(2, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        otp_service_1.OtpService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
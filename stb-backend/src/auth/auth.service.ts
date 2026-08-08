import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument } from '../employees/employee.schema';
import { Role } from '../common/enums/role.enum';
import { Device, DeviceDocument, Platform } from '../devices/device.schema';
import { Session, SessionDocument } from '../sessions/session.schema';
import { OtpService } from '../otp/otp.service';
import { OtpPurpose } from '../otp/otp.schema';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../common/enums/audit-action.enum';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import {
  ActivateRequestDto,
  VerifyOtpDto,
  CreatePasswordDto,
  CreatePinDto,
  LoginDto,
  BiometricLoginDto,
  PinLoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  EnableBiometricsDto,
  ChangeDeviceDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 30; //30

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private auditService: AuditService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  //  STEP 1 — Account Activation Request
  // ═══════════════════════════════════════════════════════════════
  async requestActivation(dto: ActivateRequestDto): Promise<{ message: string; devCode?: string }> {
    const employee = await this.employeeModel
      .findOne({
        matricule: dto.matricule.toUpperCase(),
        cin: dto.cin.toUpperCase(),
      })
      .exec();

    if (!employee) {
      throw new NotFoundException('Employé introuvable. Vérifiez votre matricule et CIN.');
    }

    if (employee.isActivated) {
      throw new BadRequestException('Ce compte est déjà activé.');
    }

    // Verify date of birth
    const dob = new Date(dto.dateNaissance);
    const empDob = new Date(employee.dateNaissance);
    if (dob.toDateString() !== empDob.toDateString()) {
      throw new UnauthorizedException('Date de naissance incorrecte.');
    }

    const result = await this.otpService.sendOtp(
      employee._id.toString(),
      OtpPurpose.ACTIVATION,
      employee.email,
      employee.phone,
    );

    await this.auditService.log(employee._id.toString(), AuditAction.OTP_SENT, true, {
      metadata: { purpose: OtpPurpose.ACTIVATION },
    });

    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  //  STEP 2 — Verify OTP
  // ═══════════════════════════════════════════════════════════════
  async verifyOtp(dto: VerifyOtpDto): Promise<{ verified: boolean; token: string }> {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');

    const purpose = dto.purpose as OtpPurpose;
    const isValid = await this.otpService.verifyOtp(
      employee._id.toString(),
      purpose,
      dto.code,
    );

    if (!isValid) {
      await this.auditService.log(employee._id.toString(), AuditAction.OTP_FAILED, false);
      throw new UnauthorizedException('Code OTP invalide ou expiré.');
    }

    await this.auditService.log(employee._id.toString(), AuditAction.OTP_VERIFIED, true);

    // Return a short-lived setup token (not a full JWT session)
    const setupToken = this.jwtService.sign(
      { sub: employee._id.toString(), matricule: employee.matricule, purpose, step: 'otp_verified' },
      { expiresIn: '15m' },
    );

    return { verified: true, token: setupToken };
  }

  // ═══════════════════════════════════════════════════════════════
  //  STEP 3 — Create Password (after OTP)
  // ═══════════════════════════════════════════════════════════════
  async createPassword(employeeId: string, dto: CreatePasswordDto): Promise<{ message: string }> {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('+passwordHash')
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    await this.employeeModel.updateOne(
      { _id: employee._id },
      { passwordHash, passwordChangedAt: new Date() },
    );

    return { message: 'Mot de passe créé avec succès.' };
  }

  // ═══════════════════════════════════════════════════════════════
  //  STEP 4 — Create PIN
  // ═══════════════════════════════════════════════════════════════
  async createPin(employeeId: string, dto: CreatePinDto): Promise<{ message: string }> {
    const employee = await this.employeeModel
      .findById(employeeId)
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');

    const pinHash = await bcrypt.hash(dto.pin, this.SALT_ROUNDS);
    await this.employeeModel.updateOne({ _id: employee._id }, { pinHash });

    return { message: 'PIN créé avec succès.' };
  }

  // ═══════════════════════════════════════════════════════════════
  //  STEP 5 — Enable Biometrics & Complete Activation
  // ═══════════════════════════════════════════════════════════════
  async enableBiometrics(
    employeeId: string,
    dto: EnableBiometricsDto,
  ): Promise<{ message: string }> {
    const update: Partial<EmployeeDocument> = {};

    if (dto.type === 'FACE_ID' || dto.type === 'BOTH') update.faceEnabled = true;
    if (dto.type === 'FINGERPRINT' || dto.type === 'BOTH') update.fingerEnabled = true;

    // Mark account as fully activated
    update.isActivated = true;
    update.status = EmployeeStatus.ACTIVE as any;

    await this.employeeModel.updateOne({ _id: employeeId }, update);

    // Mark device as trusted + biometrics enabled
    await this.deviceModel.updateOne(
      { deviceUUID: dto.deviceUUID, employeeId: new Types.ObjectId(employeeId) },
      { trusted: true, biometricsEnabled: true },
      { upsert: false },
    );

    await this.auditService.log(employeeId, AuditAction.BIOMETRICS_ENABLED, true, {
      metadata: { type: dto.type },
    });

    await this.auditService.log(employeeId, AuditAction.ACCOUNT_ACTIVATED, true);

    return { message: 'Biométrie activée. Compte entièrement activé. Bienvenue dans STB Mobile !' };
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOGIN — Password-Based
  // ═══════════════════════════════════════════════════════════════
  async login(
    dto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    employee: Partial<EmployeeDocument>;
    isNewDevice: boolean;
    requiresDeviceVerification: boolean;
  }> {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .select('+passwordHash')
      .exec();

    if (!employee) {
      throw new UnauthorizedException('Matricule ou mot de passe incorrect.');
    }

    // Check account status
    if (!employee.isActivated) {
      throw new ForbiddenException('Compte non activé. Contactez les RH.');
    }

    if (employee.status === EmployeeStatus.SUSPENDED) {
      throw new ForbiddenException('Compte suspendu. Contactez les RH.');
    }

    // Check lockout
    if (employee.lockedUntil && employee.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (employee.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Compte verrouillé. Réessayez dans ${minutesLeft} minute(s).`,
      );
    }

    // Verify password
    if (!employee.passwordHash) {
      throw new BadRequestException('Mot de passe non défini. Activez votre compte d\'abord.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, employee.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(employee);
      await this.auditService.log(employee._id.toString(), AuditAction.LOGIN_FAILED, false, {
        ip,
        userAgent,
        metadata: { matricule: dto.matricule },
      });
      throw new UnauthorizedException('Matricule ou mot de passe incorrect.');
    }

    // Reset failed attempts on successful login
    await this.employeeModel.updateOne(
      { _id: employee._id },
      { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    );

    // ─── Device Handling ────────────────────────────────────────
    let isNewDevice = false;
    let requiresDeviceVerification = false;
    let deviceDoc: DeviceDocument | null = null;

    if (dto.deviceUUID) {
      deviceDoc = await this.deviceModel.findOne({ deviceUUID: dto.deviceUUID }).exec();

      if (!deviceDoc) {
        isNewDevice = true;
        requiresDeviceVerification = true;
        // Create unverified device
        deviceDoc = await this.deviceModel.create({
          employeeId: employee._id,
          deviceUUID: dto.deviceUUID,
          deviceName: dto.deviceName || 'Unknown Device',
          platform: (dto.platform as Platform) || Platform.IOS,
          trusted: false,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          loginCount: 1,
        });
      } else {
        await this.deviceModel.updateOne(
          { _id: deviceDoc._id },
          { lastLoginAt: new Date(), lastLoginIp: ip, $inc: { loginCount: 1 } },
        );
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(employee);

    // Store session
    await this.createSession(
      employee._id.toString(),
      tokens,
      deviceDoc?._id?.toString() || null,
      ip,
      userAgent,
    );

    await this.auditService.log(employee._id.toString(), AuditAction.LOGIN, true, {
      ip,
      userAgent,
      deviceUUID: dto.deviceUUID,
      metadata: { isNewDevice },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...safeEmployee } = employee.toObject();

    return {
      ...tokens,
      employee: safeEmployee,
      isNewDevice,
      requiresDeviceVerification,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOGIN WEB — Dashboard RH (no mobile activation required)
  // ═══════════════════════════════════════════════════════════════
  async loginWeb(
    dto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    employee: Partial<EmployeeDocument>;
  }> {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .select('+passwordHash')
      .exec();

    console.log('--- LOGIN WEB DEBUG ---');
    console.log('Matricule:', dto.matricule.toUpperCase());
    console.log('Employee found?:', !!employee);

    if (!employee) {
      console.log('Failed: !employee');
      throw new UnauthorizedException('Matricule ou mot de passe incorrect.');
    }

      // Allow RH / ADMIN / SUPER_ADMIN / FINANCE / AGENCE / MANAGER / IT roles
      const allowedRoles = [Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.AGENCE, Role.MANAGER, Role.IT];
      const hasAccess = employee.roles.some((r) => allowedRoles.includes(r as Role));
    if (!hasAccess) {
      throw new ForbiddenException("Accès refusé. Réservé aux ressources humaines, administrateurs et équipe IT.");
    }

    if (employee.status === EmployeeStatus.SUSPENDED) {
      throw new ForbiddenException('Compte suspendu. Contactez le service informatique.');
    }

    // Check lockout
    if (employee.lockedUntil && employee.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (employee.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Compte verrouillé. Réessayez dans ${minutesLeft} minute(s).`,
      );
    }

    // Verify password
    if (!employee.passwordHash) {
      throw new BadRequestException(
        'Mot de passe non défini. Demandez à un administrateur de configurer votre accès.'
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, employee.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(employee);
      await this.auditService.log(employee._id.toString(), AuditAction.LOGIN_FAILED, false, {
        ip,
        userAgent,
        metadata: { matricule: dto.matricule, channel: 'WEB_DASHBOARD' },
      });
      throw new UnauthorizedException('Matricule ou mot de passe incorrect.');
    }

    // Reset failed attempts on successful login & auto-activate web users
    await this.employeeModel.updateOne(
      { _id: employee._id },
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        // Auto-mark as activated for web-only RH users
        isActivated: true,
        status: EmployeeStatus.ACTIVE,
      },
    );

    const tokens = await this.generateTokens(employee);

    await this.createSession(
      employee._id.toString(),
      tokens,
      null,
      ip,
      userAgent,
    );

    await this.auditService.log(employee._id.toString(), AuditAction.LOGIN, true, {
      ip,
      userAgent,
      metadata: { channel: 'WEB_DASHBOARD' },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, pinHash, ...safeEmployee } = employee.toObject();

    return {
      ...tokens,
      employee: safeEmployee,
    };
  }


  // ═══════════════════════════════════════════════════════════════
  //  BIOMETRIC LOGIN
  // ═══════════════════════════════════════════════════════════════
  async biometricLogin(
    dto: BiometricLoginDto,
    ip?: string,
    userAgent?: string,
  ) {
    const device = await this.deviceModel
      .findOne({ deviceUUID: dto.deviceUUID, trusted: true })
      .exec();

    if (!device) {
      throw new UnauthorizedException('Appareil non reconnu ou non approuvé.');
    }

    if (!device.biometricsEnabled) {
      throw new ForbiddenException('La biométrie n\'est pas activée sur cet appareil.');
    }

    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .exec();

    if (!employee || !employee.isActivated) {
      throw new UnauthorizedException('Employé introuvable ou compte non activé.');
    }

    // Verify device belongs to this employee
    if (device.employeeId.toString() !== employee._id.toString()) {
      throw new ForbiddenException('Appareil non associé à ce compte.');
    }

    const tokens = await this.generateTokens(employee);
    await this.createSession(
      employee._id.toString(),
      tokens,
      device._id?.toString(),
      ip,
      userAgent,
    );

    const auditAction =
      dto.biometricType === 'FACE_ID'
        ? AuditAction.FACE_ID_SUCCESS
        : AuditAction.FINGERPRINT_SUCCESS;

    await this.auditService.log(employee._id.toString(), auditAction, true, {
      ip,
      userAgent,
      deviceUUID: dto.deviceUUID,
    });

    await this.employeeModel.updateOne(
      { _id: employee._id },
      { lastLoginAt: new Date() },
    );

    return { ...tokens, employee: { matricule: employee.matricule, nom: employee.nom, prenom: employee.prenom, roles: employee.roles } };
  }

  // ═══════════════════════════════════════════════════════════════
  //  PIN LOGIN
  // ═══════════════════════════════════════════════════════════════
  async pinLogin(dto: PinLoginDto, ip?: string, userAgent?: string) {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .select('+pinHash')
      .exec();

    if (!employee || !employee.isActivated) {
      throw new UnauthorizedException('Employé introuvable ou compte non activé.');
    }

    if (!employee.pinHash) {
      throw new BadRequestException('PIN non défini. Configurez votre PIN d\'abord.');
    }

    const isPinValid = await bcrypt.compare(dto.pin, employee.pinHash);

    if (!isPinValid) {
      await this.auditService.log(employee._id.toString(), AuditAction.PIN_FAILED, false, { ip });
      throw new UnauthorizedException('PIN incorrect.');
    }

    const tokens = await this.generateTokens(employee);
    const deviceDoc = dto.deviceUUID
      ? await this.deviceModel.findOne({ deviceUUID: dto.deviceUUID }).exec()
      : null;

    await this.createSession(
      employee._id.toString(),
      tokens,
      deviceDoc?._id?.toString() || null,
      ip,
      userAgent,
    );

    await this.auditService.log(employee._id.toString(), AuditAction.PIN_SUCCESS, true, { ip });
    await this.employeeModel.updateOne({ _id: employee._id }, { lastLoginAt: new Date() });

    return tokens;
  }

  // ═══════════════════════════════════════════════════════════════
  //  REFRESH TOKEN
  // ═══════════════════════════════════════════════════════════════
  async refreshToken(dto: RefreshTokenDto) {
    const session = await this.sessionModel
      .findOne({
        refreshToken: dto.refreshToken,
        isRevoked: false,
        refreshTokenExpiresAt: { $gt: new Date() },
      })
      .exec();

    if (!session) {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    const employee = await this.employeeModel.findById(session.employeeId).exec();
    if (!employee || !employee.isActivated) {
      throw new UnauthorizedException('Compte non valide.');
    }

    // Rotate tokens: revoke old session
    await this.sessionModel.updateOne(
      { _id: session._id },
      { isRevoked: true, revokedAt: new Date() },
    );

    const tokens = await this.generateTokens(employee);
    await this.createSession(
      employee._id.toString(),
      tokens,
      session.deviceId?.toString() || null,
      session.ip ?? undefined,
      session.userAgent ?? undefined,
    );

    await this.auditService.log(
      employee._id.toString(),
      AuditAction.TOKEN_REFRESHED,
      true,
    );

    return tokens;
  }

  // ═══════════════════════════════════════════════════════════════
  //  FORGOT PASSWORD
  // ═══════════════════════════════════════════════════════════════
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; devCode?: string }> {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .exec();

    if (!employee) {
      // Don't reveal whether employee exists
      return { message: 'Si ce matricule existe, un OTP a été envoyé à l\'email associé.' };
    }

    const result = await this.otpService.sendOtp(
      employee._id.toString(),
      OtpPurpose.PASSWORD_RESET,
      employee.email,
    );

    await this.auditService.log(employee._id.toString(), AuditAction.OTP_SENT, true, {
      metadata: { purpose: OtpPurpose.PASSWORD_RESET },
    });

    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  //  RESET PASSWORD
  // ═══════════════════════════════════════════════════════════════
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');

    const isValid = await this.otpService.verifyOtp(
      employee._id.toString(),
      OtpPurpose.PASSWORD_RESET,
      dto.otpCode,
    );

    if (!isValid) {
      throw new UnauthorizedException('Code OTP invalide ou expiré.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.employeeModel.updateOne(
      { _id: employee._id },
      { passwordHash, passwordChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null },
    );

    // Revoke all sessions after password reset
    await this.sessionModel.updateMany(
      { employeeId: employee._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );

    await this.auditService.log(employee._id.toString(), AuditAction.PASSWORD_RESET, true);

    return { message: 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.' };
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOGOUT
  // ═══════════════════════════════════════════════════════════════
  async logout(employeeId: string, accessToken: string): Promise<{ message: string }> {
    await this.sessionModel.updateOne(
      { accessToken, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );

    await this.auditService.log(employeeId, AuditAction.LOGOUT, true);

    return { message: 'Déconnexion réussie.' };
  }

  // ═══════════════════════════════════════════════════════════════
  //  CHANGE DEVICE
  // ═══════════════════════════════════════════════════════════════
  async changeDevice(dto: ChangeDeviceDto): Promise<{ message: string; devCode?: string }> {
    const employee = await this.employeeModel
      .findOne({ matricule: dto.matricule.toUpperCase() })
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');

    const isValid = await this.otpService.verifyOtp(
      employee._id.toString(),
      OtpPurpose.DEVICE_CHANGE,
      dto.otpCode,
    );

    if (!isValid) throw new UnauthorizedException('Code OTP invalide ou expiré.');

    // Remove all old trusted devices
    await this.deviceModel.updateMany(
      { employeeId: employee._id, trusted: true },
      { trusted: false },
    );

    // Create new trusted device
    await this.deviceModel.create({
      employeeId: employee._id,
      deviceUUID: dto.newDeviceUUID,
      deviceName: dto.newDeviceName,
      trusted: true,
      lastLoginAt: new Date(),
    });

    await this.auditService.log(employee._id.toString(), AuditAction.DEVICE_TRUSTED, true, {
      metadata: { newDevice: dto.newDeviceName },
    });

    return { message: 'Nouvel appareil approuvé avec succès.' };
  }

  // ═══════════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════

  private async generateTokens(employee: EmployeeDocument) {
    const payload: JwtPayload = {
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

  private async createSession(
    employeeId: string,
    tokens: { accessToken: string; refreshToken: string },
    deviceId: string | null,
    ip?: string,
    userAgent?: string,
  ) {
    const accessExpiresAt = new Date(
      Date.now() + this.parseExpiry(this.configService.get('JWT_ACCESS_EXPIRES', '15m')),
    );
    const refreshExpiresAt = new Date(
      Date.now() + this.parseExpiry(this.configService.get('JWT_REFRESH_EXPIRES', '30d')),
    );

    const create = async (tokensToUse: { accessToken: string; refreshToken: string }) => {
      await this.sessionModel.create({
        employeeId: new Types.ObjectId(employeeId),
        deviceId: deviceId ? new Types.ObjectId(deviceId) : null,
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
    } catch (e: any) {
        if (e?.code === 11000 && e?.keyPattern?.accessToken) {
          const emp = await this.employeeModel.findById(employeeId).exec();
          if (!emp) throw e;
          const newTokens = await this.generateTokens(emp);
          await create(newTokens);
        } else {
        throw e;
      }
    }
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] || 60 * 1000);
  }

  private async handleFailedLogin(employee: EmployeeDocument): Promise<void> {
    const attempts = employee.failedLoginAttempts + 1;
    const update: Record<string, any> = { failedLoginAttempts: attempts };

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      update.lockedUntil = new Date(
        Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000,
      );
      await this.auditService.log(
        employee._id.toString(),
        AuditAction.ACCOUNT_LOCKED,
        false,
        { metadata: { attempts } },
      );
    }

    await this.employeeModel.updateOne({ _id: employee._id }, update);
  }
}

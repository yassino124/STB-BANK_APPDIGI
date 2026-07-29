import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmployeeDocument } from '../employees/employee.schema';
import { Role } from '../common/enums/role.enum';
import { DeviceDocument } from '../devices/device.schema';
import { SessionDocument } from '../sessions/session.schema';
import { OtpService } from '../otp/otp.service';
import { AuditService } from '../audit/audit.service';
import { ActivateRequestDto, VerifyOtpDto, CreatePasswordDto, CreatePinDto, LoginDto, BiometricLoginDto, PinLoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, EnableBiometricsDto, ChangeDeviceDto } from './dto/auth.dto';
export declare class AuthService {
    private employeeModel;
    private deviceModel;
    private sessionModel;
    private jwtService;
    private configService;
    private otpService;
    private auditService;
    private readonly logger;
    private readonly SALT_ROUNDS;
    private readonly MAX_LOGIN_ATTEMPTS;
    private readonly LOCK_DURATION_MINUTES;
    constructor(employeeModel: Model<EmployeeDocument>, deviceModel: Model<DeviceDocument>, sessionModel: Model<SessionDocument>, jwtService: JwtService, configService: ConfigService, otpService: OtpService, auditService: AuditService);
    requestActivation(dto: ActivateRequestDto): Promise<{
        message: string;
        devCode?: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        verified: boolean;
        token: string;
    }>;
    createPassword(employeeId: string, dto: CreatePasswordDto): Promise<{
        message: string;
    }>;
    createPin(employeeId: string, dto: CreatePinDto): Promise<{
        message: string;
    }>;
    enableBiometrics(employeeId: string, dto: EnableBiometricsDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, ip?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        employee: Partial<EmployeeDocument>;
        isNewDevice: boolean;
        requiresDeviceVerification: boolean;
    }>;
    loginWeb(dto: LoginDto, ip?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        employee: Partial<EmployeeDocument>;
    }>;
    biometricLogin(dto: BiometricLoginDto, ip?: string, userAgent?: string): Promise<{
        employee: {
            matricule: string;
            nom: string;
            prenom: string;
            roles: Role[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    pinLogin(dto: PinLoginDto, ip?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        devCode?: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    logout(employeeId: string, accessToken: string): Promise<{
        message: string;
    }>;
    changeDevice(dto: ChangeDeviceDto): Promise<{
        message: string;
        devCode?: string;
    }>;
    private generateTokens;
    private createSession;
    private parseExpiry;
    private handleFailedLogin;
}

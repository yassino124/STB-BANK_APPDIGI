import type { Request } from 'express';
import { AuthService } from './auth.service';
import { EmployeesService } from '../employees/employees.service';
import { ActivateRequestDto, VerifyOtpDto, CreatePasswordDto, CreatePinDto, LoginDto, BiometricLoginDto, PinLoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, EnableBiometricsDto, ChangeDeviceDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly employeesService;
    constructor(authService: AuthService, employeesService: EmployeesService);
    requestActivation(dto: ActivateRequestDto, req: Request): Promise<{
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
    login(dto: LoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        employee: Partial<import("../employees/employee.schema").EmployeeDocument>;
        isNewDevice: boolean;
        requiresDeviceVerification: boolean;
    }>;
    loginWeb(dto: LoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        employee: Partial<import("../employees/employee.schema").EmployeeDocument>;
    }>;
    biometricLogin(dto: BiometricLoginDto, req: Request): Promise<{
        employee: {
            matricule: string;
            nom: string;
            prenom: string;
            roles: import("../common/enums/role.enum").Role[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    pinLogin(dto: PinLoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(employeeId: string, authHeader: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        devCode?: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changeDevice(dto: ChangeDeviceDto): Promise<{
        message: string;
        devCode?: string;
    }>;
    me(user: any): Promise<import("../employees/employee.schema").EmployeeDocument>;
}

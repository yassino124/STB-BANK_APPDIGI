export declare class ActivateRequestDto {
    matricule: string;
    cin: string;
    dateNaissance: string;
}
export declare class VerifyOtpDto {
    matricule: string;
    code: string;
    purpose: string;
}
export declare class CreatePasswordDto {
    matricule: string;
    password: string;
}
export declare class CreatePinDto {
    matricule: string;
    pin: string;
}
export declare class LoginDto {
    matricule: string;
    password: string;
    deviceUUID?: string;
    deviceName?: string;
    platform?: string;
}
export declare class BiometricLoginDto {
    deviceUUID: string;
    matricule: string;
    biometricType: string;
}
export declare class PinLoginDto {
    matricule: string;
    pin: string;
    deviceUUID?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    matricule: string;
}
export declare class ResetPasswordDto {
    matricule: string;
    otpCode: string;
    newPassword: string;
}
export declare class EnableBiometricsDto {
    type: string;
    deviceUUID: string;
}
export declare class ChangeDeviceDto {
    matricule: string;
    newDeviceUUID: string;
    newDeviceName: string;
    otpCode: string;
}

export declare const SECURITY_CONSTANTS: {
    readonly JWT_ACCESS_EXPIRY: "15m";
    readonly JWT_REFRESH_EXPIRY: "30d";
    readonly SALT_ROUNDS: 12;
    readonly MAX_LOGIN_ATTEMPTS: 5;
    readonly LOCK_DURATION_MINUTES: 30;
    readonly OTP_LENGTH: 6;
    readonly OTP_EXPIRY_MINUTES: 5;
    readonly PIN_MIN_LENGTH: 6;
    readonly PIN_MAX_LENGTH: 6;
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_MAX_LENGTH: 128;
    readonly REFRESH_TOKEN_ROTATION: true;
    readonly SESSION_TIMEOUT_MINUTES: 60;
    readonly DEVICE_TRUST_REQUIRED: true;
};

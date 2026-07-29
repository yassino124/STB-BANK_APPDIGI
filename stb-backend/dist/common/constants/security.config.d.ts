export declare class SecurityConfig {
    static readonly BCRYPT_ROUNDS = 12;
    static readonly MAX_LOGIN_ATTEMPTS = 5;
    static readonly LOCK_DURATION_MINUTES = 30;
    static readonly OTP_LENGTH = 6;
    static readonly OTP_EXPIRY_MINUTES = 5;
    static readonly PIN_LENGTH = 6;
    static readonly PASSWORD_MIN_LENGTH = 8;
    static readonly PASSWORD_MAX_LENGTH = 128;
    static readonly SESSION_TIMEOUT_MINUTES = 60;
    static readonly REFRESH_TOKEN_ROTATION = true;
    static readonly DEVICE_TRUST_REQUIRED = true;
    static readonly RATE_LIMIT_TTL = 60;
    static readonly RATE_LIMIT_LIMIT = 10;
    static readonly CORS_ORIGINS: string[];
}

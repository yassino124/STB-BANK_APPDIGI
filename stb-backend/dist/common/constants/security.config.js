"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfig = void 0;
class SecurityConfig {
    static BCRYPT_ROUNDS = 12;
    static MAX_LOGIN_ATTEMPTS = 5;
    static LOCK_DURATION_MINUTES = 30;
    static OTP_LENGTH = 6;
    static OTP_EXPIRY_MINUTES = 5;
    static PIN_LENGTH = 6;
    static PASSWORD_MIN_LENGTH = 8;
    static PASSWORD_MAX_LENGTH = 128;
    static SESSION_TIMEOUT_MINUTES = 60;
    static REFRESH_TOKEN_ROTATION = true;
    static DEVICE_TRUST_REQUIRED = true;
    static RATE_LIMIT_TTL = 60;
    static RATE_LIMIT_LIMIT = 10;
    static CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173'];
}
exports.SecurityConfig = SecurityConfig;
//# sourceMappingURL=security.config.js.map
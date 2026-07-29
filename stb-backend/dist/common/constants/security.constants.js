"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECURITY_CONSTANTS = void 0;
exports.SECURITY_CONSTANTS = {
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '30d',
    SALT_ROUNDS: 12,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_DURATION_MINUTES: 30,
    OTP_LENGTH: 6,
    OTP_EXPIRY_MINUTES: 5,
    PIN_MIN_LENGTH: 6,
    PIN_MAX_LENGTH: 6,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    REFRESH_TOKEN_ROTATION: true,
    SESSION_TIMEOUT_MINUTES: 60,
    DEVICE_TRUST_REQUIRED: true,
};
//# sourceMappingURL=security.constants.js.map
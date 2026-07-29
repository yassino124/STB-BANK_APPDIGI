"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRES || '30d',
    issuer: process.env.JWT_ISSUER || 'stb-backend',
    audience: process.env.JWT_AUDIENCE || 'stb-mobile',
}));
//# sourceMappingURL=jwt.config.js.map
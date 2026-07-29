"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('swagger', () => ({
    title: process.env.SWAGGER_TITLE || 'STB Backend API',
    description: process.env.SWAGGER_DESCRIPTION || 'Enterprise Banking Backend API',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    path: process.env.SWAGGER_PATH || 'docs',
}));
//# sourceMappingURL=swagger.config.js.map
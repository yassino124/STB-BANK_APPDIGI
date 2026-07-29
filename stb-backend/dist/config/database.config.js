"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db',
    dbName: process.env.MONGODB_DB_NAME || 'stb_db',
    connectionOptions: {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
        minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10),
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '30000', 10),
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000', 10),
    },
}));
//# sourceMappingURL=database.config.js.map